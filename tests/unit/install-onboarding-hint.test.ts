import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const source = readFileSync('install.mjs', 'utf8');
const declaration = source.match(/const onboardingLaunchCommand = [\s\S]*?;\n/)![0];
function hint(windows: boolean, directory: string): string {
  return runInNewContext(`${declaration}\nonboardingLaunchCommand`, {
    IS_WINDOWS: windows, INSTALL_DIR: directory,
  });
}

describe('installer onboarding launch hint', () => {
  it('uses two PowerShell 5 and 7 compatible commands with literal path quoting', () => {
    expect(hint(true, "C:\\Users\\O'Brien $home\\ascendops"))
      .toBe("Set-Location -LiteralPath 'C:\\Users\\O''Brien $home\\ascendops'\nclaude /onboarding");
    expect(source).toContain("IS_WINDOWS ? 'these two commands in order' : 'this single command'");
  });
  it.each(['darwin', 'linux'])('preserves the existing %s command', () => {
    expect(hint(false, '/synthetic home/ascendops'))
      .toBe('cd "/synthetic home/ascendops" && claude /onboarding');
  });
});
