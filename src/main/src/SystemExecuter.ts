import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { exec, spawn } from 'child_process';
import { ChildProcessByStdio } from 'child_process';
import { Readable } from 'stream';

class SystemExecuter {
  private static instance: SystemExecuter;
  private readonly asarPath = app.getAppPath();
  private readonly appPath = this.asarPath.substring(0, this.asarPath.lastIndexOf(path.sep));
  private readonly venvPath = path.join(this.appPath, 'resources', 'venv');
  private readonly pythonPath =
    process.platform == 'win32'
      ? path.join(this.venvPath, 'Scripts', 'python.exe')
      : path.join(this.venvPath, 'bin', 'python');
  private readonly activatePath =
    process.platform == 'win32'
      ? path.join(this.venvPath, 'Scripts', 'activate.bat')
      : path.join(this.venvPath, 'bin', 'activate');
  private logHandlers: ((data: any) => void)[] = [];
  private child: ChildProcessByStdio<null, Readable, Readable> | null = null;

  private constructor() {}

  public static getInstance(): SystemExecuter {
    // Singleton pattern
    if (!SystemExecuter.instance) {
      SystemExecuter.instance = new SystemExecuter();
    }
    return SystemExecuter.instance;
  }

  public async setUpVenv(): Promise<boolean> {
    const isVenvReady = this.checkVenv();

    // Will take a long time (about 3 min) when the first install the venv and fs.
    const result = await this.executeSetVenv(!isVenvReady);
    if (result === 'success') {
      return true;
    } else {
      throw new Error(result);
    }
  }

  public checkVenv(): boolean {
    return (
      fs.existsSync(this.venvPath) &&
      fs.existsSync(this.pythonPath) &&
      fs.existsSync(this.activatePath)
    );
  }

  private async executeSetVenv(shouldCreateVenv: boolean): Promise<string> {
    const execPromise = util.promisify(exec);
    try {
      if (shouldCreateVenv) {
        const { stderr: venvError } = await execPromise('python -m venv ' + this.venvPath);
        if (venvError) return venvError;
      }

      const { stderr: pipError } = await execPromise(
        this.pythonPath + ' -m pip install --upgrade pip'
      );
      if (pipError) return pipError;

      const { stderr: installError } = await execPromise(
        this.pythonPath + ' -m pip install fosslight_scanner'
      );
      if (installError) return installError;

      /* TODO: This 'always update' takes long time. Need to check the version first.
      const { stderr: updateError } = await execPromise(
        this.pythonPath + ' -m pip install fosslight_scanner --upgrade --force-reinstall'
      );
      if (updateError) {
        console.error('Update fosslight sccanner failed: ' + updateError);
        return false;
      }
      */

      return 'success';
    } catch (error) {
      return `${error}`;
    }
  }

  public async executeScanner(args: string[][]): Promise<CommandResponse> {
    const mode: string = args[0].join(' ');
    const jobs: number = mode === 'compare' ? 1 : args[1].length + args[2].length;
    const finalArgs: string[] = [];
    const result: CommandResponse = { success: false, message: '', data: [] };

    for (let i = 0; i < jobs; i++) {
      finalArgs.length = 0;

      if (mode === 'compare') {
        const comparePath = '-p ' + args[1].join(' ');
        finalArgs.push(mode, comparePath, ...args[3]);
      } else {
        if (args[1][0] === 'undefined') {
          finalArgs.push(mode, '-p .', ...args[3]);
        } else if (i < args[1].length) {
          finalArgs.push(mode, '-p ' + args[1][i], ...args[3]);
        } else {
          finalArgs.push(mode, '-w ' + args[2][i - args[1].length], ...args[3]);
        }
      }

      try {
        const scannedPath: string = await this.scanProcess(finalArgs);
        result.data.push(scannedPath);
      } catch (error) {
        result.message = `${error}`;
        return result;
      }
    }

    result.success = true;
    result.message = 'Fosslight Scanner finished successfully';
    return result;
  }

  public async saveSetting(setting: Setting): Promise<string> {
    return new Promise((resolve, reject) => {
      const settingPath = path.join(app.getAppPath(), 'resources', 'setting.json');
      fs.writeFile(settingPath, JSON.stringify(setting), (error) => {
        if (error) {
          reject(`Failed to save setting: ${error.message}`);
        } else {
          resolve('Setting file saved successfully');
        }
      });
    });
  }

  private scanProcess(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let path: string = '';
      const shellCommand =
        process.platform === 'win32'
          ? `cmd.exe /c "${this.activatePath} && fosslight ${args.join(' ')}"`
          : `bash -c "source ${this.activatePath} && fosslight ${args.join(' ')}"`;

      args.forEach((arg) => {
        if (arg.startsWith('-p')) path = arg.replace('-p ', '');
        else if (arg.startsWith('-w')) path = arg.replace('-w ', '');
      });

      this.child = spawn(shellCommand, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });

      this.child.stdout.on('data', this.handleLog);
      this.child.stderr.on('data', this.handleLog);

      this.child.on('close', (code) => {
        this.child = null;
        code === 0
          ? resolve(path)
          : reject(`scan is stopped where path: ${path}, with exit code: ${code}`);
      });

      this.child.on('error', (error) => {
        this.child = null;
        reject(`scan is stopped where path: ${path}, with error: ${error.message}`);
      });
    });
  }

  public forceQuit() {
    if (this.child) {
      try {
        process.platform == 'win32'
          ? exec(`taskkill /pid ${this.child.pid} /T /F`)
          : exec(`kill -9 ${this.child.pid}`);
      } catch (error) {
        // TODO : Need to handle force quit error
        // console.error('Failed to force stop the fosslight scanner: ' + error);
        return;
      }
    }
  }

  private handleLog = (data: any): void => {
    this.logHandlers.forEach((handler) => handler(data.toString()));
  };

  public onLog(handler: (data: any) => void): void {
    this.logHandlers.push(handler);
  }

  public offLog(handler: (data: any) => void): void {
    this.logHandlers = this.logHandlers.filter((h) => h !== handler);
  }
}

export default SystemExecuter;
