import {IParameterAwareProps} from "./IParameterAwareProps";
import {Environment} from "aws-cdk-lib";

export class ParameterAwareProps implements IParameterAwareProps {
  // handling/defining the application name.
  // Default is NRTA - Near Real-Time Application
  static defaultApplicationName: string = 'NRTA';
  applicationName?: string;
  env?: Environment;

  constructor(props?: IParameterAwareProps) {
    this.applicationName = (props && props.applicationName && props.applicationName.length > 0) ? props.applicationName : ParameterAwareProps.defaultApplicationName;
    if (props) {
      this.env = props.env;
      if (props.getParameters()) {
        props.getParameters().forEach((v, k) => this.addParameter(k, v));
      }
    }
  }

  setApplicationName(appName: string) {
    if (appName && appName.length > 0) this.applicationName = appName.toUpperCase();
  }

  getApplicationName() {
    let appName = this.applicationName ? this.applicationName : ParameterAwareProps.defaultApplicationName;
    return appName;
  }

  parameters: Map<string, any>;

  getParameters(): Map<string, any> {
    return this.parameters;
  };

  addParameters(parameters: Map<string, any>) {
    if (parameters) {
      if (!this.parameters) this.parameters = new Map<string, any>();
      for (let parameterName of parameters.keys()) {
        this.parameters.set(parameterName.toLowerCase(), parameters.get(parameterName))
      }
    }
  };

  addParameter(key: string, parameter: any): void {
    if (parameter) {
      if (!this.parameters) this.parameters = new Map<string, any>();
      this.parameters.set(key.toLowerCase(), parameter);
    }
  }

  getParameter(key: string): any | undefined {
    if (!this.parameters) this.parameters = new Map<string, any>();
    return this.parameters.get(key.toLowerCase());
  }


}