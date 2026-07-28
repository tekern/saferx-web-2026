/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../types";
import { User as UserIcon, Lock, Phone, Building, MapPin, Shield, LogOut, Check, X, FileText, AlertTriangle } from "lucide-react";

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

  // 약관 / 정책 / 탈퇴 관련 모달 상태
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showWithdrawStep1, setShowWithdrawStep1] = useState(false);
  const [showWithdrawStep2, setShowWithdrawStep2] = useState(false);
  const [withdrawPwInput, setWithdrawPwInput] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

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

      {/* 약관 / 정책 / 회원탈퇴 버튼 영역 */}
      <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#2A2A2F]">
          <Shield className="w-4 h-4 text-[#00D1E8]" />
          서비스 약관 및 계정 관리
        </h3>

        <div className="flex flex-wrap gap-3 text-xs">
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="px-4 py-2.5 bg-[#111113] hover:bg-[#2A2A2F] border border-[#2A2A2F] text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#00D1E8]" />
            이용약관 보기
          </button>
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="px-4 py-2.5 bg-[#111113] hover:bg-[#2A2A2F] border border-[#2A2A2F] text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-[#00D1E8]" />
            개인정보처리방침 보기
          </button>
          <button
            type="button"
            onClick={() => setShowWithdrawStep1(true)}
            className="px-4 py-2.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] font-bold rounded-lg transition-colors cursor-pointer ml-auto flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            회원탈퇴
          </button>
        </div>
      </div>

      {/* 하단 로그아웃 */}
      <div className="pt-4 border-t border-[#2A2A2F]">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer text-xs"
        >
          <LogOut className="w-4 h-4 text-[#8A8A96]" />
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

      {/* 이용약관 모달 */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="w-full max-w-2xl bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2F]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00D1E8]" />
                통합안전관제시스템 서비스 이용약관
              </h3>
              <button onClick={() => setShowTermsModal(false)} className="text-[#8A8A96] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-[#ECECEC] leading-relaxed pr-2">
              <h4 className="font-bold text-sm text-[#00D1E8]">제 1 조 (목적)</h4>
              <p>본 약관은 통합건설안전관제시스템(이하 "시스템")이 제공하는 관제 및 알림 관련 제반 서비스의 이용조건 및 절차, 이용자와 시스템 운영자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
              
              <h4 className="font-bold text-sm text-[#00D1E8]">제 2 조 (용어의 정의)</h4>
              <p>1. "서비스"라 함은 현장 CCTV, AI 분석, IoT 센서, 근로자 위치 확인 및 비상 경보 통보 등 안전관제를 목적으로 제공되는 모든 기능을 의미합니다.<br />2. "회원"이라 함은 본 약관에 동의하고 승인을 받아 시스템을 이용하는 사용자를 말합니다.</p>
              
              <h4 className="font-bold text-sm text-[#00D1E8]">제 3 조 (약관의 효력 및 변경)</h4>
              <p>본 약관은 시스템 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다. 시스템은 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
              
              <h4 className="font-bold text-sm text-[#00D1E8]">제 4 조 (안전 수칙 준수 의무)</h4>
              <p>회원은 시스템을 이용함에 있어 산업안전보건법 및 관제 수칙을 엄수하여야 하며, 무단으로 타인의 계정을 이용하거나 관제 정보 및 영상을 외부에 유출해서는 안 됩니다.</p>
            </div>
            <div className="pt-3 border-t border-[#2A2A2F] text-right">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded-lg text-xs cursor-pointer"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="w-full max-w-2xl bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2F]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00D1E8]" />
                개인정보 처리방침
              </h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-[#8A8A96] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-[#ECECEC] leading-relaxed pr-2">
              <h4 className="font-bold text-sm text-[#00D1E8]">1. 개인정보의 수집 및 이용 목적</h4>
              <p>본 관제시스템은 건설현장의 중대재해 예방, 긴급 SOS 구조 요청 처리, AI 안전 수칙 이행 확인 및 접속 로그 이력 관리를 목적으로 최소한의 개인정보를 수집 및 처리합니다.</p>
              
              <h4 className="font-bold text-sm text-[#00D1E8]">2. 수집하는 개인정보 항목</h4>
              <p>- 필수항목: 성명, 아이디, 비밀번호, 소속 기관/회사, 휴대전화번호, 담당 구역/현장<br />- 자동수집항목: 접속 IP, 위치 조회 및 센서 수신 이력, 개인정보 처리 이력 로그</p>
              
              <h4 className="font-bold text-sm text-[#00D1E8]">3. 개인정보의 보유 및 이용기간</h4>
              <p>관련 안전 법령 및 통신비밀보호법에 의거하여, 회원 탈퇴 시 또는 목적 달성 후 지체 없이 파기하며 접속 로그는 최고 2년간 보관됩니다.</p>
              
              <h4 className="font-bold text-sm text-[#00D1E8]">4. 정보주체의 권리</h4>
              <p>이용자는 언제든지 본인의 개인정보 열람, 정지, 수정 및 삭제를 요청할 수 있으며, 마이페이지를 통해 직접 관리할 수 있습니다.</p>
            </div>
            <div className="pt-3 border-t border-[#2A2A2F] text-right">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded-lg text-xs cursor-pointer"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 Step 1: 비밀번호 확인 팝업 */}
      {showWithdrawStep1 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2F]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                회원탈퇴 - 비밀번호 확인
              </h3>
              <button onClick={() => setShowWithdrawStep1(false)} className="text-[#8A8A96] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-[#8A8A96]">
              안전한 본인 확인을 위해 현재 계정의 비밀번호를 입력해 주세요.
            </p>

            {withdrawError && (
              <div className="p-2 bg-[#EF4444]/10 border border-[#EF4444]/40 text-[#EF4444] text-xs font-bold text-center rounded">
                {withdrawError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[#8A8A96] font-semibold text-xs">비밀번호</label>
              <input
                type="password"
                required
                value={withdrawPwInput}
                onChange={(e) => setWithdrawPwInput(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full bg-[#111113] border border-[#2A2A2F] focus:border-[#EF4444] text-white px-3 py-2.5 rounded-lg outline-none text-xs"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowWithdrawStep1(false);
                  setWithdrawPwInput("");
                  setWithdrawError("");
                }}
                className="flex-1 py-2.5 bg-[#2A2A2F] text-white font-bold rounded-lg cursor-pointer text-xs"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!withdrawPwInput) {
                    setWithdrawError("비밀번호를 입력해 주세요.");
                    return;
                  }
                  // Allow matching user password or demo pw '123'
                  if (withdrawPwInput === (user.password || "123") || withdrawPwInput === "1234" || withdrawPwInput === "123") {
                    setWithdrawError("");
                    setShowWithdrawStep1(false);
                    setShowWithdrawStep2(true);
                  } else {
                    setWithdrawError("비밀번호가 일치하지 않습니다.");
                  }
                }}
                className="flex-1 py-2.5 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold rounded-lg cursor-pointer text-xs"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 Step 2: 회원탈퇴 안내 팝업 */}
      {showWithdrawStep2 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="w-full max-w-lg bg-[#222226] border border-[#EF4444]/40 rounded-xl p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2F]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                회원탈퇴 안내 및 최종 동의
              </h3>
              <button onClick={() => setShowWithdrawStep2(false)} className="text-[#8A8A96] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4 space-y-2 text-[#ECECEC]">
              <h4 className="font-bold text-sm text-[#EF4444]">⚠️ 탈퇴 전 반드시 확인하세요</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#8A8A96]">
                <li>회원탈퇴 시 보유하신 계정 권한 및 등록된 소속 정보가 즉시 해제됩니다.</li>
                <li>관제 모니터링 및 알림 수신 권한이 차단되어 안전 사고 발생 시 조치가 불가할 수 있습니다.</li>
                <li>법정 보존 로그를 제외한 본인 계정의 설정 정보는 즉시 파기되며 복구할 수 없습니다.</li>
              </ul>
            </div>

            <p className="text-white font-semibold text-center">
              정말로 회원 탈퇴를 진행하시겠습니까?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWithdrawStep2(false)}
                className="flex-1 py-3 bg-[#2A2A2F] text-white font-bold rounded-lg cursor-pointer"
              >
                취소 (탈퇴 안 함)
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
                  setShowWithdrawStep2(false);
                  onLogout();
                }}
                className="flex-1 py-3 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold rounded-lg cursor-pointer"
              >
                탈퇴 동의 및 회원탈퇴
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
