import React from 'react';

/**
 * LazyLoader provides React.lazy components for code-splitting.
 * Use these for applications that need on-demand loading of components.
 */

export const DashKaleido = React.lazy(
  () =>
    import(
      /* webpackChunkName: "DashKaleido" */ './fragments/DashKaleido'
    )
);

export const KaleidoManager = React.lazy(
  () =>
    import(
      /* webpackChunkName: "KaleidoManager" */ './fragments/KaleidoManager/KaleidoManager'
    )
);

export const KaleidoTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "KaleidoTab" */ './fragments/KaleidoTab'
    )
);
