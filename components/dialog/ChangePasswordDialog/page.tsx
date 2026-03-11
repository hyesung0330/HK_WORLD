import React, { useState } from "react";
import { useTheme } from "@/app/context/darkmood";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function ChangePasswordDialog() {
    const { darkMode } = useTheme();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setOpen(false);
                setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                toast.error(data.message || "비밀번호 변경에 실패했습니다.");
            }
        } catch (error) {
            toast.error("서버와의 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className={`flex items-center gap-3 w-full p-4 rounded-2xl border transition-all active:scale-[0.98] ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:bg-slate-50 shadow-sm'}`}>
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <Lock size={16} className="opacity-60" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-black">비밀번호 변경</span>
                        <span className="text-[10px] font-bold opacity-30">계정 보안을 위해 주기적으로 변경해주세요</span>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-[400px] border-none rounded-3xl ${darkMode ? "bg-[#0a0a0a] text-white" : "bg-white text-slate-900"}`}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tighter">비밀번호 변경</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">현재 비밀번호</Label>
                        <Input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            required
                            className={`${darkMode ? "bg-white/5 border-none" : "bg-slate-100 border-none"}`}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">새 비밀번호</Label>
                        <Input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            required
                            className={`${darkMode ? "bg-white/5 border-none" : "bg-slate-100 border-none"}`}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">새 비밀번호 확인</Label>
                        <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            className={`${darkMode ? "bg-white/5 border-none" : "bg-slate-100 border-none"}`}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full h-12 rounded-xl font-black mt-4 ${darkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white hover:bg-zinc-800"}`}
                    >
                        {isLoading ? "변경 중..." : "비밀번호 변경 완료"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
