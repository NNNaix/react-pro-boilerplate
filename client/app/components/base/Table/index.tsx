import React from 'react';

import { Table as BaseTable } from 'antd';
import {
    ColumnProps as BaseColumnsProps,
    TableProps as BaseTableProps,
    TablePaginationConfig as BaseTablePaginationConfig,
} from 'antd/es/table';

export type TableProps<RecordType> = BaseTableProps<RecordType>;
export type ColumnProps<T = any> = BaseColumnsProps<T>;
export type TablePaginationConfig = BaseTablePaginationConfig;
function Table<RecordType extends Record<string, unknown> = any>(props: TableProps<RecordType>) {
    return <BaseTable {...props} />;
}

export default Table;
