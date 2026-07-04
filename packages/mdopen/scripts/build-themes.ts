import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
const csso = require('csso');

const THEMES_DIR = path.resolve(__dirname, '../themes');
const TEMP_DIR = path.resolve(__dirname, '../.temp-themes');
const CLEANRMD_REPO = 'https://github.com/gadenbuie/cleanrmd.git';

const THEME_MAPPING: Record<string, string> = {
  'inst/resources/almond/almond.css': 'almond.css',
  'inst/resources/awsm.css/awsm.css': 'awsm.css',
  'inst/resources/axist/axist.css': 'axist.css',
  'inst/resources/bamboo/bamboo.css': 'bamboo.css',
  'inst/resources/bullframe/bullframe.css': 'bullframe.css',
  'inst/resources/holiday/holiday.css': 'holiday.css',
  'inst/resources/kacit/kacit.css': 'kacit.css',
  'inst/resources/latex.css/latex.css': 'latex.css',
  'inst/resources/markdown-modest/markdown-modest.css': 'modest.css',
  'inst/resources/markdown-retro/markdown-retro.css': 'retro.css',
  'inst/resources/marx/marx.css': 'marx.css',
  'inst/resources/minicss/minicss.css': 'mini.css',
  'inst/resources/new.css/new.css': 'new.css',
  'inst/resources/no-class/no-class.css': 'no-class.css',
  'inst/resources/picocss/pico.css': 'pico.css',
  'inst/resources/sakura/sakura.css': 'sakura.css',
  'inst/resources/sakura-vader/sakura-vader.css': 'sakura-vader.css',
  'inst/resources/semantic/semantic.css': 'semantic.css',
  'inst/resources/simplecss/simple.css': 'simple.css',
  'inst/resources/style-sans/style-sans.css': 'style-sans.css',
  'inst/resources/style-serif/style-serif.css': 'style-serif.css',
  'inst/resources/stylize/stylize.css': 'stylize.css',
  'inst/resources/superstylin/superstylin.css': 'superstylin.css',
  'inst/resources/tacit/tacit.css': 'tacit.css',
  'inst/resources/vanilla/vanilla.css': 'vanilla.css',
  'inst/resources/water/water.css': 'water.css',
  'inst/resources/water-dark/water-dark.css': 'water-dark.css',
  'inst/resources/writ/writ.css': 'writ.css',
};

async function buildThemes() {
  try {
    if (!fs.existsSync(THEMES_DIR)) {
      fs.mkdirSync(THEMES_DIR, { recursive: true });
    }

    console.log('Cloning cleanrmd repository...');
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    execSync(`git clone --depth 1 ${CLEANRMD_REPO} ${TEMP_DIR}`);

    console.log('Processing cleanrmd themes...');
    for (const [srcRelPath, destName] of Object.entries(THEME_MAPPING)) {
      const srcPath = path.join(TEMP_DIR, srcRelPath);
      const destPath = path.join(THEMES_DIR, destName);
      
      if (fs.existsSync(srcPath)) {
        const css = fs.readFileSync(srcPath, 'utf8');
        const minified = csso.minify(css).css;
        fs.writeFileSync(destPath, minified);
        console.log(`Built ${destName}`);
      } else {
        console.warn(`Source not found for ${destName}: ${srcPath}`);
      }
    }

    console.log('Processing GitHub themes...');
    try {
      // Try to find github-markdown-css in node_modules
      const githubCssPath = require.resolve('github-markdown-css');
      const githubDir = path.dirname(githubCssPath);
      
      const githubThemes = [
        { src: 'github-markdown-light.css', dest: 'github.css' },
        { src: 'github-markdown-dark.css', dest: 'github-dark.css' },
      ];

      for (const { src, dest } of githubThemes) {
        const srcPath = path.join(githubDir, src);
        const destPath = path.join(THEMES_DIR, dest);
        if (fs.existsSync(srcPath)) {
          const css = fs.readFileSync(srcPath, 'utf8');
          const minified = csso.minify(css).css;
          fs.writeFileSync(destPath, minified);
          console.log(`Built ${dest}`);
        }
      }

      // Copy Prism themes
      const prismDir = path.dirname(require.resolve('prismjs/package.json'));
      const prismThemesDir = path.join(prismDir, 'themes');
      const prismThemes = [
        { src: 'prism.css', dest: 'prism.css' },
        { src: 'prism-dark.css', dest: 'prism-dark.css' },
      ];

      for (const { src, dest } of prismThemes) {
        const srcPath = path.join(prismThemesDir, src);
        const destPath = path.join(THEMES_DIR, dest);
        if (fs.existsSync(srcPath)) {
          const css = fs.readFileSync(srcPath, 'utf8');
          const minified = csso.minify(css).css;
          fs.writeFileSync(destPath, minified);
          console.log(`Built ${dest}`);
        }
      }
    } catch (e) {
      console.error('Failed to process GitHub or Prism themes:', e);
    }

    console.log('Cleaning up...');
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    
    console.log('Successfully built all themes!');
  } catch (error) {
    console.error('Error building themes:', error);
    process.exit(1);
  }
}

buildThemes();
