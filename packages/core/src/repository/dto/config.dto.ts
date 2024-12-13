type Primitive = string | number;

export type ConfigValue = Primitive | Primitive[] | { [key: string]: ConfigValue } | ConfigValue[];

export type ConfigDto = {
	storeId: string;
	id: string;
	value: ConfigValue;
};
