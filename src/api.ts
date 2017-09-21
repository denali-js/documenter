export default interface Project {
  name: string;
  version: string;
  packages: {
    [packageName: string]: Package;
  }
}

export interface Package {
  classes: {
    [className: string]: Class;
  },
  interfaces: {
    [interfaceName: string]: Interface;
  },
  functions: FreeFunction[]
}

export interface Class {
  name: string;
  description?: string;
  staticProperties: {
    [propertyName: string]: Property;
  };
  staticMethods: {
    [methodName: string]: Method;
  };
  properties: {
    [propertyName: string]: Property;
  };
  methods: {
    [methodName: string]: Method;
  };
}

// :mind-blown:
export interface Interface {
  name: string;
  description?: string;
  properties: {
    [propertyName: string]: Property;
  };
  methods: {
    [methodName: string]: Method;
  };
}

export interface Member {
  name?: string;
  description?: string;
  access?: string;
  tags: Tag[];
  deprecated?: string | boolean;
  inherited?: boolean | null;
  file?: string;
  line?: number;
}

export interface Property extends Member {
  type?: string;
}

export interface Method extends Member {
  signatures?: MethodSignature[];
}

export interface MethodSignature {
  // TODO expose type params too
  parameters: Param[];
  return: Return;
}

export interface Param {
  name: string;
  type?: string;
  description?: string;
}

export interface Return {
  type?: string;
  description?: string;
}

export interface Tag {
  name: string;
  value: string | boolean;
}

export interface FreeFunction extends Method {
  package?: string;
}
