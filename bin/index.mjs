#! /usr/bin/env node
import fs from 'fs-extra';
import { parseString, Builder } from 'xml2js';

async function bumpAndroidManifest(path, value) {
  const manifestPath = `${path}/android/app/src/main/AndroidManifest.xml`;
  const manifestData = await fs.readFile(manifestPath, 'utf8');
  parseString(manifestData, (err, result) => {
    if (err) {
      console.error('Error parsing AndroidManifest.xml:', err);
      return;
    }

    // Find the desired meta-data element
    const metaDataList = result.manifest.application[0]['meta-data'];
    const expoRuntimeVersionMetaData = metaDataList.find(
      (metaData) => {
        return metaData.$['android:name'] === 'expo.modules.updates.EXPO_RUNTIME_VERSION'
      }
    );
    if (expoRuntimeVersionMetaData) {
      console.log('Updating AndroidManifest.xml with new version:', value)
      expoRuntimeVersionMetaData.$['android:value'] = value;
    }

    // Convert the modified XML back to string
    const builder = new Builder();
    const modifiedManifestData = builder.buildObject(result);

    // Save the modified XML back to the file
    fs.writeFile(manifestPath, modifiedManifestData, (err) => {
      if (err) {
        console.error('Error writing AndroidManifest.xml:', err);
      } else {
        console.log('AndroidManifest.xml updated successfully.');
      }
    });
  })
}

async function bumpBuildGradle(path, versionCode, versionName) {

  const buildGradlePath = `${path}/android/app/build.gradle`;

  fs.readFile(buildGradlePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading build.gradle:', err);
      return;
    }
  
    // Update the versionCode and versionName
    let updatedContent = data.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
    updatedContent = updatedContent.replace(/versionName\s+"[\d\.]+"/, `versionName "${versionName}"`);
  
    // Write the updated contents back to the build.gradle file
    fs.writeFile(buildGradlePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing build.gradle:', err);
        return;
      }
      console.log('build.gradle file updated successfully!');
    });
  });
}

async function bumpInfoplist(path, versionCode, versionName) {
  const InfoPlistpath = `${path}/ios/Dotmoovs/Info.plist`;
  fs.readFile(InfoPlistpath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading Info.plist:', err);
      return;
    }
  
    // Update CFBundleShortVersionString
    let updatedContent = data.replace(/<key>CFBundleShortVersionString<\/key>\s+<string>[\d\.]+<\/string>/, `<key>CFBundleShortVersionString</key>\n\t<string>${versionName}</string>`);
  
    // Update CFBundleVersion
    updatedContent = updatedContent.replace(/<key>CFBundleVersion<\/key>\s+<string>\d+<\/string>/, `<key>CFBundleVersion</key>\n\t<string>${versionCode}</string>`);
  
    // Write the updated contents back to the Info.plist file
    fs.writeFile(InfoPlistpath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing Info.plist:', err);
        return;
      }
      console.log('Info.plist file updated successfully!');
    });
  });  
}

async function bumpExpoplist(path, versionName) {
  const expoplistPath = `${path}/ios/Dotmoovs/Supporting/Expo.plist`;
  console.log(expoplistPath)

  if (!fs.existsSync(expoplistPath)) {
    console.error('Expo.plist file does not exist.');
    return;
  }
  // Read the contents of the Expo.plist file
  fs.readFile(expoplistPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading Expo.plist:', err);
      return;
    }

    // Update EXUpdatesRuntimeVersion
    const updatedContent = data.replace(
      /<key>EXUpdatesRuntimeVersion<\/key>\s+<string>[^<]+<\/string>/,
      `<key>EXUpdatesRuntimeVersion</key>\n\t\t<string>${versionName}</string>`
    );

    // Write the updated contents back to the Expo.plist file
    fs.writeFile(expoplistPath, updatedContent, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing Expo.plist:', writeErr);
        return;
      }
      console.log('Expo.plist file updated successfully!');
    });
  });
}

async function bumpAppJson(path, versionName) {
  const appJsonPath = `${path}/app.json`;
  fs.readFile(appJsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading app.json:', err);
      return;
    }

    // Update runtimeVersion
    const updatedContent = data.replace(
      /"runtimeVersion": "([^"]+)"/,
      `"runtimeVersion": "${versionName}"`
    );

    // Write the updated contents back to the app.json file
    fs.writeFile(appJsonPath, updatedContent, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing app.json:', writeErr);
        return;
      }
      console.log('app.json file updated successfully!');
    });
  });
}

async function appConfig(path, versionName) {
  const appConfigPath = `${path}/app.config.js`;
  fs.readFile(appConfigPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading app.config.js:', err);
      return;
    }

    // Update the value of const version
    const updatedContent = data.replace(
      /const version = '[^']*';/,
      `const version = '${versionName}';`
    );

    // Write the updated contents back to the app.config.js file
    fs.writeFile(appConfigPath, updatedContent, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing app.config.js:', writeErr);
        return;
      }
      console.log('app.config.js file updated successfully!');
    });
  });
}

async function main() {
  try {
    const path = process.argv[2]; // Access the first command-line argument
    const versionCode = process.argv[3]; // Access the second command-line argument
    const versionName = process.argv[4]; // Access the third command-line argument

    if (!path) {
      console.error('Please provide the path to the project.');
      return;
    }

    if (!versionCode) {
      console.error('Please provide the version code.');
      return;
    }

    if (!versionName) {
      console.error('Please provide the version name.');
      return;
    }

    await bumpAndroidManifest(path, versionName);
    await bumpBuildGradle(path, versionCode, versionName);
    await bumpInfoplist(path, versionCode, versionName);
    await bumpExpoplist(path, versionName);
    await bumpAppJson(path, versionName);
    await appConfig(path, versionName);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();