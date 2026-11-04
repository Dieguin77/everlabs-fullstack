import { Prisma } from '@prisma/client';

/**
 * Test helper: checks Prisma query arguments against the REAL schema (via Prisma.dmmf), the
 * way Prisma does at runtime. A repository test that fakes the Prisma client can then fail
 * on exactly the mistake that broke production: `include: { user }` on a model that only
 * has `author`. Mocks alone cannot catch that, because they accept any shape.
 */
type Field = { name: string; kind: string; type: string };

const models = new Map(Prisma.dmmf.datamodel.models.map((model) => [model.name, model.fields as readonly Field[]]));

function fieldsOf(modelName: string): readonly Field[] {
  const fields = models.get(modelName);
  if (!fields) throw new Error(`Unknown model ${modelName}`);
  return fields;
}

function checkSelectOrInclude(modelName: string, kind: 'select' | 'include', args: Record<string, unknown>) {
  const fields = fieldsOf(modelName);

  for (const [name, value] of Object.entries(args)) {
    const field = fields.find((f) => f.name === name);

    if (!field || (kind === 'include' && field.kind !== 'object')) {
      throw new Error(`Unknown field \`${name}\` for ${kind} statement on model \`${modelName}\`.`);
    }

    if (field.kind === 'object' && value && typeof value === 'object') {
      assertValidPrismaArgs(field.type, value as Record<string, unknown>);
    }
  }
}

export function assertValidPrismaArgs(modelName: string, args: Record<string, unknown> = {}) {
  const fields = fieldsOf(modelName);

  if (args.include) checkSelectOrInclude(modelName, 'include', args.include as Record<string, unknown>);
  if (args.select) checkSelectOrInclude(modelName, 'select', args.select as Record<string, unknown>);

  for (const key of ['data', 'where'] as const) {
    for (const name of Object.keys((args[key] as Record<string, unknown>) ?? {})) {
      if (!fields.some((f) => f.name === name)) {
        throw new Error(`Unknown argument \`${name}\` in \`${key}\` for model \`${modelName}\`.`);
      }
    }
  }
}
