import { InternalServerErrorException } from '@nestjs/common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { QueryInput, ScanInput } from 'aws-sdk/clients/dynamodb';

const dynamodb = new DocumentClient({
  httpOptions: {
    timeout: 5000,
  },
});

// 전체 대용을 가져옵니다.
export const scanTable = async (tableName: string) => {
  const params: ScanInput = {
    TableName: tableName,
  };

  const scanResults = [];
  let items;
  do {
    items = await dynamodb.scan(params).promise();
    items.Items.forEach((item) => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== 'undefined');

  return scanResults;
};

// 테이블의 내용을 쿼리하여 가져옵니다.
export const queryTable = async (
  tableName: string,
  FilterExpression,
  expressionAttributeNames,
  expressionAttributeValues,
) => {
  const params: ScanInput = {
    TableName: tableName,
    FilterExpression: FilterExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  const queryResults = [];
  let items;
  do {
    items = await dynamodb.scan(params).promise();
    items.Items.forEach((item) => queryResults.push(item));

    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== 'undefined');

  return queryResults;
};
