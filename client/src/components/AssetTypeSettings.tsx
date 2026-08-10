import { useEffect, useState } from 'react';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { addAssetType, AssetType, deleteAssetType, getAssetTypes, updateAssetType } from '../api';

type Props = { onChanged: () => void };

export default function AssetTypeSettings({ onChanged }: Props) {
  const [types, setTypes] = useState<AssetType[]>([]);
  const [name, setName] = useState('');
  const [isLiability, setIsLiability] = useState(false);
  const [editing, setEditing] = useState<AssetType | null>(null);
  const load = async () => setTypes((await getAssetTypes()).data);
  useEffect(() => { void load(); }, []);
  const refresh = async () => { await load(); onChanged(); };
  const saveNew = async () => { if (!name.trim()) return; await addAssetType(name, isLiability); setName(''); setIsLiability(false); await refresh(); };
  const saveEdit = async () => { if (!editing || !editing.name.trim()) return; await updateAssetType(editing.id, editing.name, editing.isLiability); setEditing(null); await refresh(); };
  const remove = async (type: AssetType) => { if (!window.confirm(`'${type.name}' 유형을 삭제할까요? 사용 중인 유형은 삭제할 수 없습니다.`)) return; try { await deleteAssetType(type.id); await refresh(); } catch (error: any) { alert(error?.response?.data?.message || '사용 중인 유형은 삭제할 수 없습니다.'); } };
  return <div className="asset-type-settings">
    <div className="asset-type-add"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="새 자산 유형" /><label><input type="checkbox" checked={isLiability} onChange={(event) => setIsLiability(event.target.checked)} /> 부채로 계산</label><button className="btn btn-primary" onClick={() => void saveNew()}><Plus size={16} /> 추가</button></div>
    <div className="asset-type-list">{types.map((type) => editing?.id === type.id ? <div className="asset-type-row" key={type.id}><input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /><label><input type="checkbox" checked={editing.isLiability} onChange={(event) => setEditing({ ...editing, isLiability: event.target.checked })} /> 부채로 계산</label><button className="btn-icon" onClick={() => void saveEdit()}><Check size={16} /></button><button className="btn-icon" onClick={() => setEditing(null)}><X size={16} /></button></div> : <div className="asset-type-row" key={type.id}><strong>{type.name}</strong><span>{type.isLiability ? '부채' : '자산'}</span><button className="btn-icon" onClick={() => setEditing(type)}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={() => void remove(type)}><Trash2 size={16} /></button></div>)}</div>
  </div>;
}
