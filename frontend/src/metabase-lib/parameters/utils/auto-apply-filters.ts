import Question from "metabase-lib/Question";
import {
  compareMappingOptionTargets,
  getDashcardParameterAttributes,
} from "metabase-lib/parameters/utils/targets";
import { getParameterMappingOptions } from "metabase/parameters/utils/mapping-options";
import type {
  DashboardCard,
  DashboardParameterMapping,
  ParameterId,
  ParameterTarget,
} from "metabase-types/api";
import type Metadata from "metabase-lib/metadata/Metadata";
import { isDimensionTarget } from "metabase-types/guards";
import Dimension from "metabase-lib/Dimension";

export const getMatchingDashcardAttributes = (
  dashcardToMatch: DashboardCard,
  dashcardList: DashboardCard[],
  target: ParameterTarget | null,
  parameterId: ParameterId,
  metadata: Metadata,
) => {
  if (!target || !isDimensionTarget(target)) {
    return [];
  }

  const matches = [];

  const unmappedDashcards = dashcardList.filter(dc => !dc.parameter_mappings?.find(mapping => mapping.parameter_id === parameterId));

  for (const dashcardListElement of unmappedDashcards) {

    const mappingOptions: DashboardParameterMapping[] =
      getParameterMappingOptions(
        metadata,
        null,
        dashcardListElement.card,
        dashcardListElement as unknown as null,
      );

    const match = mappingOptions.find(mappingOption =>
      compareMappingOptionTargets(
        target,
        mappingOption.target,
        dashcardToMatch,
        dashcardListElement,
        metadata,
      ),
    );

    if (match) {
      matches.push({
        id: dashcardListElement.id,
        attributes: {
          parameter_mappings: getDashcardParameterAttributes(
            dashcardListElement,
            dashcardListElement.card_id,
            parameterId,
            match.target,
          ),
        },
      });
    }
  }

  return matches;
};
