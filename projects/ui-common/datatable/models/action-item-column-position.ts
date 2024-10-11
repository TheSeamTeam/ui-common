const ActionItemColumnPosition = ['frozenLeft', 'frozenRight', 'staticLeft', 'staticRight'] as const

/**
 * If `frozenLeft`, action item column will be fixed to the left side of the table.
 *
 * If `frozenRight`, action item column will be fixed to the right side of the table.
 *
 * If `staticLeft`, action item column will be the first static column on the left side of the table.
 *
 * If `staticRight`, action item column will be the last static column on the right side of the table.
 */
export type ActionItemColumnPosition = typeof ActionItemColumnPosition[number];

export function isActionItemColumnPosition(input: unknown): input is ActionItemColumnPosition {
  return ActionItemColumnPosition.indexOf(input as ActionItemColumnPosition) != -1;
}
