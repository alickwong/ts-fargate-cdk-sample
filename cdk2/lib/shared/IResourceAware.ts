export interface IResourceAware {
  getResources(): Map<string, any>;

  getResource(resourceName: string): any | undefined;

  addResources(resources: Map<string, any>): void;

  addResource(map: string, resource: any): void;

  getResourcesNames(): IterableIterator<string> | string[];
}