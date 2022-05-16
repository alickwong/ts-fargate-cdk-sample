import {Stack} from "aws-cdk-lib";
import {IResourceAware} from "./IResourceAware";
import {Construct} from "constructs";
import {IParameterAwareProps} from "./IParameterAwareProps";
import {ParameterAwareProps} from "./ParameterAwareProps";

export class ResourceAwareStack extends Stack implements IResourceAware {

  protected resources: Map<string, any>;
  protected scope: Construct | undefined;
  protected properties: IParameterAwareProps;

  constructor(parent?: Construct, name?: string, props?: IParameterAwareProps) {
    super(parent, name, props);
    if (this.scope) {
      this.scope = parent;
    }

    if (!this.properties) {
      this.properties = new ParameterAwareProps(props);
    }

    if (!this.properties.region) {
      this.properties.region = this.region;
    }
  }

  getResources(): Map<string, any> {
    return this.resources;
  };

  addResources(resources: Map<string, any>) {
    if (resources) {
      if (!this.resources) this.resources = new Map<string, any>();
      for (let resourceName of resources.keys()) {
        let name = resourceName.toLowerCase();
        this.resources.set(name, resources.get(name));
      }
    }
  };

  addResource(key: string, resource: any): void {
    if (resource) {
      if (!this.resources) this.resources = new Map<string, any>();
      this.resources.set(key.toLowerCase(), resource);
    }
  }

  getResource(key: string): any | undefined {
    if (!this.resources) this.resources = new Map<string, any>();
    return this.resources.get(key.toLowerCase());
  }

  getResourcesNames() {
    if (this.resources) return this.resources.keys();
    else return [];
  }

  getProperties() {
    return this.properties;
  }
}