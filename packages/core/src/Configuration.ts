import { Backend } from './Backend';
import { Reporter } from './Reporter';

export interface Configuration {
  before: Backend;
  after: Backend;
  reporters: Reporter[];
}
