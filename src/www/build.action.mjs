// Copyright 2022 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import fs from "fs/promises";
import webpack from "webpack";

import electronConfig from "./webpack_electron.mjs";
import cordovaConfig from "./webpack_cordova.mjs";

import {getBuildParameters} from "../../scripts/get_build_parameters.mjs";
import {getBuildEnvironment} from "../../scripts/get_build_environment.mjs";
import {getWebpackBuildMode} from "../../scripts/get_webpack_build_mode.mjs";

const webpackPromise = webpackConfig =>
  new Promise((resolve, reject) => {
    webpack(webpackConfig, (error, stats) => {
      if (error || stats.hasErrors()) {
        reject(error || "Unknown Webpack error.");
      }

      resolve(stats);
    });
  });

/**
 * @description Builds the web UI for use across both electron and cordova.
 *
 * @param {string[]} parameters
 */
export async function main(...parameters) {
  const {platform, buildMode} = getBuildParameters(parameters);

  // write build environment
  await fs.mkdir("www", {recursive: true});
  await fs.writeFile("www/environment.json", JSON.stringify(await getBuildEnvironment(platform, buildMode)));

  // get correct webpack config
  let webpackConfig;

  switch (platform) {
    case "windows":
    case "linux":
      webpackConfig = electronConfig;
    case "ios":
    case "macos":
    case "android":
    default:
      webpackConfig = cordovaConfig;
      break;
  }

  webpackConfig.mode = getWebpackBuildMode(buildMode);

  await webpackPromise(webpackConfig);
}
