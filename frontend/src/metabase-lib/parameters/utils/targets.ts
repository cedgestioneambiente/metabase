import _ from "underscore";
import type {
  Card,
  DashboardCard,
  DashboardParameterMapping,
  ParameterId,
  ParameterTarget,
} from "metabase-types/api";
import { isDimensionTarget } from "metabase-types/guards";
import { isActionDashCard } from "metabase/actions/utils";
import { isVirtualDashCard } from "metabase/dashboard/utils";
import Dimension from "metabase-lib/Dimension";
import type Metadata from "metabase-lib/metadata/Metadata";
import type NativeQuery from "metabase-lib/queries/NativeQuery";
import type StructuredQuery from "metabase-lib/queries/StructuredQuery";
import Question from "metabase-lib/Question";
import type TemplateTagVariable from "metabase-lib/variables/TemplateTagVariable";

export function isVariableTarget(target: ParameterTarget) {
  return target?.[0] === "variable";
}

export function getTemplateTagFromTarget(target: ParameterTarget) {
  if (!target?.[1] || target?.[0] === "text-tag") {
    return null;
  }

  const [, [type, tag]] = target;
  return type === "template-tag" ? tag : null;
}

export function getParameterTargetField(
  target: ParameterTarget,
  metadata: Metadata,
  question: Question,
) {
  if (isDimensionTarget(target)) {
    const query = question.query() as NativeQuery | StructuredQuery;
    const dimension = Dimension.parseMBQL(target[1], metadata, query);

    return dimension?.field();
  }

  return null;
}

export function buildDimensionTarget(dimension: Dimension) {
  return ["dimension", dimension.mbql()];
}

export function buildTemplateTagVariableTarget(variable: TemplateTagVariable) {
  return ["variable", variable.mbql()];
}

export function buildTextTagTarget(tagName: string): ["text-tag", string] {
  return ["text-tag", tagName];
}

export function getTargetFieldFromCard(
  target: ParameterTarget,
  card: Card,
  metadata: Metadata,
) {
  const question = new Question(card, metadata);
  const field = getParameterTargetField(target, metadata, question);
  return field ?? null;
}

export function compareMappingOptionTargets(
  target1: ParameterTarget,
  target2: ParameterTarget,
  card1: DashboardCard,
  card2: DashboardCard,
  metadata: Metadata,
) {
  if (!isDimensionTarget(target1) || !isDimensionTarget(target2)) {
    return false;
  }

  const fieldReference1 = getTargetFieldFromCard(target1, card1.card, metadata);
  const fieldReference2 = getTargetFieldFromCard(target2, card2.card, metadata);

  return fieldReference1?.id === fieldReference2?.id;
}

export const getDashcardParameterAttributes = (
  dashcard: DashboardCard,
  card_id: DashboardCard["card_id"],
  parameter_id: ParameterId,
  target: ParameterTarget,
): DashboardParameterMapping[] => {
  const isVirtual = isVirtualDashCard(dashcard);
  const isAction = isActionDashCard(dashcard);

  let parameter_mappings = dashcard.parameter_mappings || [];

  // allow mapping the same parameter to multiple action targets
  if (!isAction) {
    parameter_mappings = parameter_mappings.filter(
      (m: DashboardParameterMapping) =>
        m.card_id !== card_id || m.parameter_id !== parameter_id,
    );
  }

  if (target) {
    if (isVirtual) {
      // If this is a virtual (text) card, remove any existing mappings for the target, since text card variables
      // can only be mapped to a single parameter.
      parameter_mappings = parameter_mappings.filter(
        m => !_.isEqual(m.target, target),
      );
    }
    parameter_mappings = parameter_mappings.concat([
      {
        parameter_id,
        card_id: card_id,
        target,
      },
    ]);
  }

  return parameter_mappings;
};
