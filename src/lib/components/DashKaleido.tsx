import React from 'react';
import { DashComponentProps } from '../props';

type Props = {
  /**
   * A label that will be printed when this component is rendered.
   */
  label: string;
  /**
   * The value displayed in the input.
   */
  value?: string;
} & DashComponentProps;

/**
 * DashKaleido is an example component.
 * It takes a property, `label`, and displays it.
 * It renders an input with the property `value`
 * which is editable by the user.
 */
const DashKaleido = (props: Props) => {
  const { id, label, value, setProps } = props;

  return (
    <div id={id}>
      <p>{label}</p>
      <input value={value || ''} onChange={(e) => setProps({ value: e.target.value })} />
    </div>
  );
};

export default DashKaleido;
