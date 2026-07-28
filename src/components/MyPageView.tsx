/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../types";
import { User as UserIcon, Lock, Phone, Building, MapPin, Shield, LogOut, Check, X } from "lucide-react";

interface MyPageViewProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

export default function MyPageView({ user, onLogout, onUpdateUser }: MyPageViewProps) {
  const [showPwModal, setShowPwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" });

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneVal, setPhoneVal] = useState(user.tel || "010-1234-5678");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 4) {
      setPwMsg({ text: "새 비밀번호는 최소 4자 이상 입력해 주세요.", type: "error" });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ text: "새 비밀번호가 일치하지 않습니다.", type: "error" });
      return;
    }
    onUpdateUser({ password: newPw });
    setPwMsg({ text: "비밀번호가 성공적으로 변경되었습니다.", type: "success" });
    setTimeout(() => {
      setShowPwModal(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwMsg({ text: "", type: "" });
    }, 1200);
  };

  const handlePhoneSave = () => {
    onUpdateUser({ tel: phoneVal });
    setIsEditingPhone(false);
  };

  const roleLabel = 
    user.role === 'SYS_ADMIN' ? '시스템관리자' :
    user.role === 'SUPER_ADMIN' ? '통합관리자' :
    user.role === 'SITE_MGR' ? '현장관리자' : user.role;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto font-sans text-[#ECECEC]">
      <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2F]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#00D1E8]" />
            마이페이지
          </h2>
          <p className="text-xs text-[#8A8A96] mt-1">계정 정보 및 개인 설정을 관리할 수 있습니다.</p>
        </div>
        <div className="px-3 py-1 bg-[#00D1E8]/10 border border-[#00D1E8]/30 text-[#00D1E8] font-bold text-xs rounded-full">
          {roleLabel}
        </div>
      </div>

      {/* 개인정보 섹션 */}
      <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#2A2A2F]">
          <UserIcon className="w-4 h-4 text-[#00D1E8]" />
          개인정보
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* 아이디 */}
          <div className="space-y-1">
            <label className="text-[#8A8A96] font-semibold block">아이디 (조회 전용)</label>
            <input
              type="text"
              readOnly
              value={user.loginId || user.id}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-[#8A8A96] px-3 py-2.5 rounded-lg outline-none cursor-not-allowed"
            />
          </div>

          {/* 이름 */}
          <div className="space-y-1">
            <label className="text-[#8A8A96] font-semibold block">이름 (조회 전용)</label>
            <input
              type="text"
              readOnly
              value={user.name}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-[#8A8A96] px-3 py-2.5 rounded-lg outline-none cursor-not-allowed"
            />
          </div>

          {/* 비밀번호 */}
          <div className="space-y-1">
            <label className="text-[#8A8A96] font-semibold block">비밀번호</label>
            <div className="flex gap-2">
              <input
                type="password"
                readOnly
                value="******"
                className="flex-1 bg-[#111113] border border-[#2A2A2F] text-[#8A8A96] px-3 py-2.5 rounded-lg outline-none cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPwModal(true)}
                className="px-3.5 py-2.5 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg transition-colors cursor-pointer text-xs whitespace-nowrap"
              >
                비밀번호 변경
              </button>
            </div>
          </div>

          {/* 휴대전화번호 */}
          <div className="space-y-1">
            <label className="text-[#8A8A96] font-semibold block">휴대전화번호</label>
            <div className="flex gap-2">
              {isEditingPhone ? (
                <>
                  <input
                    type="text"
                    value={phoneVal}
                    onChange={(e) => setPhoneVal(e.target.value)}
                    className="flex-1 bg-[#111113] border border-[#00D1E8] text-[#ECECEC] px-3 py-2 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={handlePhoneSave}
                    className="px-3 py-2 bg-[#22C55E] text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> 저장
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(false)}
                    className="px-3 py-2 bg-[#2A2A2F] text-[#8A8A96] rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> 취소
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    readOnly
                    value={user.tel || phoneVal}
                    className="flex-1 bg-[#111113] border border-[#2A2A2F] text-[#ECECEC] px-3 py-2.5 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(true)}
                    className="px-3.5 py-2.5 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg transition-colors cursor-pointer text-xs whitespace-nowrap"
                  >
                    변경
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 소속정보 섹션 */}
      <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#2A2A2F]">
          <Building className="w-4 h-4 text-[#00D1E8]" />
          소속정보
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 소속 / 고객사 / 협력사 */}
          <div className="space-y-1">
            <label className="text-[#8A8A96] font-semibold block">
              {user.role === "SUPER_ADMIN" ? "소속 고객사 (조회)" : user.role === "SITE_MGR" ? "소속 협력사 (조회)" : "소속 (조회)"}
            </label>
            <input
              type="text"
              readOnly
              value={user.company || user.dept || "경기주택도시공사"}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-[#8A8A96] px-3 py-2.5 rounded-lg outline-none cursor-not-allowed"
            />
          </div>

          {/* 현장 (SITE_MGR 및 일반 사용자) */}
          {(user.role === "SITE_MGR" || user.site) && (
            <div className="space-y-1">
              <label className="text-[#8A8A96] font-semibold block">현장 (조회)</label>
              <input
                type="text"
                readOnly
                value={user.site || (user.zones === "ALL" ? "전체 현장" : user.zones || "왕숙1구역")}
                className="w-full bg-[#111113] border border-[#2A2A2F] text-[#8A8A96] px-3 py-2.5 rounded-lg outline-none cursor-not-allowed"
              />
            </div>
          )}

          {/* 역할 */}
          <div className="space-y-1">
            <label className="text-[#8A8A96] font-semibold block">역할 (조회)</label>
            <input
              type="text"
              readOnly
              value={roleLabel}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-[#8A8A96] px-3 py-2.5 rounded-lg outline-none cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* 하단 로그아웃 */}
      <div className="pt-4 border-t border-[#2A2A2F]">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#EF4444]/20 cursor-pointer text-xs"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPwModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2F]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00D1E8]" />
                비밀번호 변경
              </h3>
              <button
                onClick={() => setShowPwModal(false)}
                className="text-[#8A8A96] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
              {pwMsg.text && (
                <div
                  className={`p-2.5 rounded text-center font-bold ${
                    pwMsg.type === "error"
                      ? "bg-[#EF4444]/10 border border-[#EF4444]/40 text-[#EF4444]"
                      : "bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#22C55E]"
                  }`}
                >
                  {pwMsg.text}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[#8A8A96] font-semibold">현재 비밀번호</label>
                <input
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="현재 비밀번호 입력"
                  className="w-full bg-[#111113] border border-[#2A2A2F] focus:border-[#00D1E8] text-white px-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8A8A96] font-semibold">새 비밀번호</label>
                <input
                  type="password"
                  required
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="새 비밀번호 입력 (4자 이상)"
                  className="w-full bg-[#111113] border border-[#2A2A2F] focus:border-[#00D1E8] text-white px-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8A8A96] font-semibold">새 비밀번호 확인</label>
                <input
                  type="password"
                  required
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="새 비밀번호 다시 입력"
                  className="w-full bg-[#111113] border border-[#2A2A2F] focus:border-[#00D1E8] text-white px-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPwModal(false)}
                  className="flex-1 py-2.5 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg cursor-pointer"
                >
                  비밀번호 변경
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
