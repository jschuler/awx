import 'styled-components/macro';
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  DataListAction as _DataListAction,
  DataListCheck,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  Tooltip,
} from '@patternfly/react-core';
import { t } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import {
  ExclamationTriangleIcon,
  PencilAltIcon,
  ProjectDiagramIcon,
  RocketIcon,
} from '@patternfly/react-icons';
import styled from 'styled-components';
import DataListCell from '../../../components/DataListCell';

import { timeOfDay } from '../../../util/dates';

import { JobTemplatesAPI, WorkflowJobTemplatesAPI } from '../../../api';
import LaunchButton from '../../../components/LaunchButton';
import Sparkline from '../../../components/Sparkline';
import { toTitleCase } from '../../../util/strings';
import CopyButton from '../../../components/CopyButton';

import { BaseTableBodyRow, BaseBodyCell } from '@patternfly/react-table';

const DataListAction = styled(_DataListAction)`
  align-items: center;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(4, 40px);
`;

function TemplateListRow({
  i18n,
  template,
  isSelected,
  onSelect,
  detailUrl,
  fetchTemplates,
  index,
}) {
  const [isDisabled, setIsDisabled] = useState(false);
  const labelId = `check-action-${template.id}`;

  const copyTemplate = useCallback(async () => {
    if (template.type === 'job_template') {
      await JobTemplatesAPI.copy(template.id, {
        name: `${template.name} @ ${timeOfDay()}`,
      });
    } else {
      await WorkflowJobTemplatesAPI.copy(template.id, {
        name: `${template.name} @ ${timeOfDay()}`,
      });
    }
    await fetchTemplates();
  }, [fetchTemplates, template.id, template.name, template.type]);

  const handleCopyStart = useCallback(() => {
    setIsDisabled(true);
  }, []);

  const handleCopyFinish = useCallback(() => {
    setIsDisabled(false);
  }, []);

  const missingResourceIcon =
    template.type === 'job_template' &&
    (!template.summary_fields.project ||
      (!template.summary_fields.inventory &&
        !template.ask_inventory_on_launch));
  const actions = [];
  if (template.type === 'workflow_job_template') {
    actions.push({
      title: (
        <Tooltip content={i18n._(t`Visualizer`)} position="top">
          <Button
            isDisabled={isDisabled}
            aria-label={i18n._(t`Visualizer`)}
            css="grid-column: 1"
            variant="plain"
            component={Link}
            to={`/templates/workflow_job_template/${template.id}/visualizer`}
          >
            <ProjectDiagramIcon />
          </Button>
        </Tooltip>
      ),
    });
  }
  if (template.summary_fields.user_capabilities.start) {
    actions.push({
      title: (
        <Tooltip content={i18n._(t`Launch Template`)} position="top">
          <LaunchButton resource={template}>
            {({ handleLaunch }) => (
              <Button
                isDisabled={isDisabled}
                aria-label={i18n._(t`Launch template`)}
                css="grid-column: 2"
                variant="plain"
                onClick={handleLaunch}
              >
                <RocketIcon />
              </Button>
            )}
          </LaunchButton>
        </Tooltip>
      ),
    });
  }
  if (template.summary_fields.user_capabilities.edit) {
    actions.push({
      title: (
        <Tooltip content={i18n._(t`Edit Template`)} position="top">
          <Button
            isDisabled={isDisabled}
            aria-label={i18n._(t`Edit Template`)}
            css="grid-column: 3"
            variant="plain"
            component={Link}
            to={`/templates/${template.type}/${template.id}/edit`}
          >
            <PencilAltIcon />
          </Button>
        </Tooltip>
      ),
    });
  }
  if (template.summary_fields.user_capabilities.copy) {
    actions.push({
      title: (
        <CopyButton
          helperText={{
            tooltip: i18n._(t`Copy Template`),
            errorMessage: i18n._(t`Failed to copy template.`),
          }}
          isDisabled={isDisabled}
          onCopyStart={handleCopyStart}
          onCopyFinish={handleCopyFinish}
          copyItem={copyTemplate}
        />
      ),
    });
  }
  return (
    <BaseTableBodyRow key={`${template.id}`}>
      <BaseBodyCell
        columnIndex={0}
        rowIndex={index}
        onSelect={onSelect}
        isSelected={isSelected}
        disableSelection={isDisabled}
        id={`select-jobTemplate-${template.id}`}
      />
      <BaseBodyCell columnIndex={1} rowIndex={index}>
        <span>
          <Link to={`${detailUrl}`}>
            <b>{template.name}</b>
          </Link>
        </span>
        {missingResourceIcon && (
          <span>
            <Tooltip
              content={i18n._(t`Resources are missing from this template.`)}
              position="right"
            >
              <ExclamationTriangleIcon css="color: #c9190b; margin-left: 20px;" />
            </Tooltip>
          </span>
        )}
      </BaseBodyCell>
      <BaseBodyCell columnIndex={2} rowIndex={index}>
        {toTitleCase(template.type)}
      </BaseBodyCell>
      <BaseBodyCell columnIndex={3} rowIndex={index}>
        <Sparkline jobs={template.summary_fields.recent_jobs} />
      </BaseBodyCell>
      <BaseBodyCell columnIndex={4} rowIndex={index} actions={actions} />
    </BaseTableBodyRow>
  );
}

export { TemplateListRow as _TemplateListRow };
export default withI18n()(TemplateListRow);
