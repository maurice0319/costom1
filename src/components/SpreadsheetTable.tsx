import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, RefreshCw, Edit2, X, Check } from 'lucide-react';

export interface SpreadsheetRow {
  rowIndex: number;
  email: string;
  igAcc: string;
  topic: string;
  keyword: string;
  title: string;
  igLink: string;
  blotatoId: string;
  apiKey: string;
  canEdit: boolean;
}

interface SpreadsheetTableProps {
  data: SpreadsheetRow[];
  loading: boolean;
  onRefresh: () => void;
  onSave: (row: SpreadsheetRow) => Promise<void>;
  saving: boolean;
}

const HEADERS = ['電郵', 'IG 帳戶', '主題', '關鍵字', '標題', 'IG 連結', 'Blotato ID', 'API Key'];

export function SpreadsheetTable({ data, loading, onRefresh, onSave, saving }: SpreadsheetTableProps) {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<SpreadsheetRow | null>(null);

  const handleEdit = (row: SpreadsheetRow) => {
    setEditingRow(row.rowIndex);
    setEditedData({ ...row });
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData(null);
  };

  const handleSave = async () => {
    if (editedData) {
      await onSave(editedData);
      setEditingRow(null);
      setEditedData(null);
    }
  };

  const handleChange = (field: keyof SpreadsheetRow, value: string) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: value });
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft border-border/50">
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">正在載入資料...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-card">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">您的資料</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            重新載入
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">找不到與您電郵相符的資料</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  {HEADERS.map((header) => (
                    <TableHead key={header} className="font-semibold text-foreground whitespace-nowrap">
                      {header}
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold text-foreground w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => {
                  const isEditing = editingRow === row.rowIndex;
                  const currentData = isEditing ? editedData! : row;

                  return (
                    <TableRow 
                      key={row.rowIndex}
                      className={row.canEdit ? 'bg-accent/5 hover:bg-accent/10' : ''}
                    >
                      <TableCell className="font-medium text-muted-foreground whitespace-nowrap">
                        {row.email}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={currentData.igAcc}
                            onChange={(e) => handleChange('igAcc', e.target.value)}
                            className="h-8 min-w-[120px]"
                          />
                        ) : (
                          row.igAcc
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={currentData.topic}
                            onChange={(e) => handleChange('topic', e.target.value)}
                            className="h-8 min-w-[100px]"
                          />
                        ) : (
                          row.topic
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={currentData.keyword}
                            onChange={(e) => handleChange('keyword', e.target.value)}
                            className="h-8 min-w-[100px]"
                          />
                        ) : (
                          row.keyword
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={currentData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="h-8 min-w-[100px]"
                          />
                        ) : (
                          row.title
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={currentData.igLink}
                            onChange={(e) => handleChange('igLink', e.target.value)}
                            className="h-8 min-w-[150px]"
                          />
                        ) : (
                          row.igLink
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={currentData.blotatoId}
                            onChange={(e) => handleChange('blotatoId', e.target.value)}
                            className="h-8 min-w-[120px]"
                          />
                        ) : (
                          row.blotatoId
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={currentData.apiKey}
                            onChange={(e) => handleChange('apiKey', e.target.value)}
                            className="h-8 min-w-[120px]"
                          />
                        ) : (
                          row.apiKey
                        )}
                      </TableCell>
                      <TableCell>
                        {row.canEdit && (
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                                >
                                  {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleCancel}
                                  disabled={saving}
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(row)}
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
