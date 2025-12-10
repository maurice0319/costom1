import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SpreadsheetTable, SpreadsheetRow } from '@/components/SpreadsheetTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, TableIcon, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [data, setData] = useState<SpreadsheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('google-sheets', {
        body: { action: 'read', userEmail: user.email }
      });

      if (error) throw error;
      
      if (result?.data) {
        setData(result.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: '載入失敗',
        description: error.message || '無法載入資料，請稍後再試',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchData();
    }
  }, [user?.email]);

  const handleSave = async (row: SpreadsheetRow) => {
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('google-sheets', {
        body: { 
          action: 'update', 
          userEmail: user?.email,
          rowData: row 
        }
      });

      if (error) throw error;
      
      toast({
        title: '儲存成功',
        description: '資料已更新',
      });
      
      await fetchData();
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast({
        variant: 'destructive',
        title: '儲存失敗',
        description: error.message || '無法儲存資料，請稍後再試',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <TableIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">資料管理系統</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">登出</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">您好！</h2>
          <p className="text-muted-foreground">
            以下是與您電郵相符的資料。您可以編輯自己的記錄。
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <SpreadsheetTable
            data={data}
            loading={loading}
            onRefresh={fetchData}
            onSave={handleSave}
            saving={saving}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
