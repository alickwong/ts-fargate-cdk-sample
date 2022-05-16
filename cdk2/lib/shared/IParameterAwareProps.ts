import {StackProps} from "aws-cdk-lib";
import {IParameterAware} from "./IParameterAware";
import {IDeploymentTarget} from "./IDeploymentTarget";

export interface IParameterAwareProps extends StackProps, IParameterAware, IDeploymentTarget{
}
