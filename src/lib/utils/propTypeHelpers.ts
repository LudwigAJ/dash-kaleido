/**
 * Reusable PropTypes definitions for Dash components
 *
 * These PropTypes are used alongside TypeScript interfaces to maintain
 * Dash runtime introspection capabilities.
 */

import PropTypes from 'prop-types';

/**
 * PropType for Dash component ID (string or pattern-matching object)
 */
export const dashIdPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    type: PropTypes.string,
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
]);

/**
 * PropType for Dash loading state
 */
export const loadingStatePropType = PropTypes.shape({
  is_loading: PropTypes.bool,
  prop_name: PropTypes.string,
  component_name: PropTypes.string,
});

/**
 * PropType for a Tab object
 */
export const tabPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  layoutId: PropTypes.string,
  createdAt: PropTypes.number.isRequired,
  locked: PropTypes.bool,
  layoutParams: PropTypes.object,
  layoutParamOptionKey: PropTypes.string,
});

/**
 * PropType for layout parameter
 */
export const layoutParameterPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  hasDefault: PropTypes.bool,
  default: PropTypes.any,
  annotation: PropTypes.string,
});

/**
 * PropType for layout metadata
 */
export const layoutMetadataPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  keywords: PropTypes.arrayOf(PropTypes.string),
  allowMultiple: PropTypes.bool,
  parameters: PropTypes.arrayOf(layoutParameterPropType),
  parameterOptions: PropTypes.objectOf(
    PropTypes.shape({
      description: PropTypes.string.isRequired,
      params: PropTypes.objectOf(PropTypes.string).isRequired,
    })
  ),
});

/**
 * PropType for registered layouts object
 */
export const registeredLayoutsPropType = PropTypes.objectOf(
  layoutMetadataPropType
);

/**
 * PropType for search bar configuration
 */
export const searchBarConfigPropType = PropTypes.shape({
  show: PropTypes.bool,
  placeholder: PropTypes.string,
  position: PropTypes.oneOf(['top', 'under', 'bottom']),
  showDropdownInNewTab: PropTypes.bool,
  spawnLayoutInNewTab: PropTypes.bool,
  displayedLayouts: PropTypes.arrayOf(PropTypes.string),
});

/**
 * PropType for theme
 */
export const themePropType = PropTypes.oneOf(['light', 'dark']);

/**
 * PropType for size
 */
export const sizePropType = PropTypes.oneOf(['sm', 'md', 'lg']);

/**
 * PropType for persistence props
 */
export const persistencePropTypes = {
  persistence: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
    PropTypes.number,
  ]),
  persisted_props: PropTypes.arrayOf(PropTypes.string),
  persistence_type: PropTypes.oneOf(['local', 'session', 'memory']),
};
