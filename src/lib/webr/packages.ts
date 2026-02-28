import { WebR } from 'webr';

const REQUIRED_PACKAGES = ['dplyr', 'readr', 'ggplot2'];

export async function installRequiredPackages(webR: WebR): Promise<void> {
  await webR.installPackages(REQUIRED_PACKAGES, { quiet: true });
}

export async function loadPackages(webR: WebR): Promise<void> {
  await webR.evalRVoid(`
    suppressPackageStartupMessages({
      library(dplyr)
      library(readr)
      library(ggplot2)
    })
  `);
}
