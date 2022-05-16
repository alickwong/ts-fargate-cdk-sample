export interface IParameterAware {
  applicationName?: string,

  getApplicationName(): string

  getParameters(): Map<string, any>;

  getParameter(parameterName: string): any | undefined;

  addParameters(parameters: Map<string, any>): void;

  addParameter(map: string, resource: any): void;
}