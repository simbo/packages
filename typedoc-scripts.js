/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { JSX } from 'typedoc';

/**
 * Adds custom script tags to the head of every generated TypeDoc page.
 *
 * @param {import('typedoc').Application} app - The TypeDoc app instance.
 * @returns {void}
 */
export function customHeadScripts(app) {
  app.renderer.hooks.on('head.end', () =>
    JSX.createElement(
      JSX.Fragment,
      undefined,
      JSX.createElement('script', {
        defer: true,
        src: 'https://trk.srvkist.net/trk.js',
        'data-website-id': 'c9ce8bab-5c6d-45ae-8127-19de67d3dbb1',
      }),
      JSX.createElement('script', {
        defer: true,
        src: 'https://trk.srvkist.net/recorder.js',
        'data-website-id': 'c9ce8bab-5c6d-45ae-8127-19de67d3dbb1',
      }),
    ),
  );
}
