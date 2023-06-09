// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { buildSchema } from 'graphql';
import { TypescriptGenerator } from '../generators/typescript-client';
import { codeComment } from '../../utils/codeComment';
import generateCRUDSchemaString, {
  parseInternalTypes,
} from 'prisma-generate-schema';
import { DatabaseType } from 'prisma-datamodel';


class TestTypescriptGenerator extends TypescriptGenerator {
  renderImports() {
    return `\
${codeComment}

import { DocumentNode, GraphQLSchema  } from 'graphql'
import { makePrismaClientClass } from '../../makePrismaClientClass'
import { BaseClientOptions, Model } from '../../types'
import { typeDefs } from './prisma-schema'`;
  }
}

function compile(fileNames: string[], options: ts.CompilerOptions): number {
  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start!,
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n',
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character +
          1}): ${message}`,
      );
    } else {
      console.log(
        `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
      );
    }
  });

  return emitResult.emitSkipped ? 1 : 0;
}

export async function testTSCompilation(datamodel) {
  const schema = buildSchema(generateCRUDSchemaString(datamodel, DatabaseType.postgres));
  const generator = new TestTypescriptGenerator({
    schema,
    internalTypes: parseInternalTypes(datamodel, DatabaseType.postgres).types,
  });

  const file = generator
    .render({ endpoint: '"http://localhost:4466"' })
    .toString();
  const artifactsPath = path.join(__dirname, '..', 'artifacts');

  if (!fs.existsSync(artifactsPath)) {
    fs.mkdirSync(artifactsPath);
  }

  const filePath = path.join(__dirname, '..', 'artifacts', 'generated_ts.ts');
  await fs.writeFileSync(filePath, file);

  // TODO: Remove ugly way to ignore TS import error
  const func = 'export const typeDefs = \'\'';
  await fs.writeFileSync(path.join(artifactsPath, 'prisma-schema.ts'), func);

  return compile([filePath], {
    noEmitOnError: true,
    noImplicitAny: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
  });
}
