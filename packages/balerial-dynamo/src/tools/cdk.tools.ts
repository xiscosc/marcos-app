import { AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDbIndexKeyType, IPrimaryDynamoDbIndex, ISecondaryDynamoDbIndex } from '../type';

export function generateCdkIndexParams(index: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex) {
	return {
		partitionKey: {
			name: index.partitionKeyName,
			type: getAttributeType(index.partitionKeyType)
		},
		sortKey:
			index.sortKeyName == null || index.sortKeyType == null
				? undefined
				: {
						name: index.sortKeyName,
						type: getAttributeType(index.sortKeyType)
					}
	};
}

function getAttributeType(type: DynamoDbIndexKeyType): AttributeType {
	if (type === DynamoDbIndexKeyType.string) return AttributeType.STRING;
	return AttributeType.NUMBER;
}
