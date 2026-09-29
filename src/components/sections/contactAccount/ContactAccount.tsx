"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getAssetPath } from "@/utils/path";
import styles from "./ContactAccount.module.scss";

interface ContactAccountProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

interface FamilyMember {
  id: string;
  role_type: string; // 'groom', 'groom_father', 'groom_mother', 'bride', 'bride_father', 'bride_mother'
  name: string;
  relation: string; // '차녀', '아버지', '어머니', '장남' 등
  phone: string | null;
  is_deceased: boolean;
  bank_name: string | null;
  account_number: string | null;
  holder_name: string | null;
}

/**
 * Supabase에서 신랑/신부 및 혼주 연락처와 계좌 정보를 조회하여 아코디언 형태로 제공하는 컴포넌트
 */
export default function ContactAccount({ isTerminalMode, onCopyToast }: ContactAccountProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [openSide, setOpenSide] = useState<string | null>(null);

  const groomContentRef = useRef<HTMLDivElement>(null);
  const brideContentRef = useRef<HTMLDivElement>(null);

  /** Supabase에서 혼주 및 당사자 연락처/계좌 목록 조회 */
  useEffect(() => {
    async function fetchFamilyMembers() {
      try {
        const { data, error } = await supabase
          .from("wedding_family_members")
          .select("*");

        if (error) throw error;
        if (data) {
          setFamilyMembers(data);
        }
      } catch (error) {
        console.error("Failed to fetch family members from Supabase:", error);
      }
    }

    fetchFamilyMembers();
  }, []);

  const handleToggle = (side: string) => {
    setOpenSide(openSide === side ? null : side);
  };

  const handleCopy = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      if (onCopyToast) {
        onCopyToast();
      }
    });
  };

  // role_type에 따라 신랑 측과 신부 측 그룹 분류
  const groomMembers = familyMembers.filter((m) => m.role_type && m.role_type.startsWith("groom"));
  const brideMembers = familyMembers.filter((m) => m.role_type && m.role_type.startsWith("bride"));

  /** DB의 relation 값을 화면에 맞게 깔끔한 명칭("혼주 (부)", "혼주 (모)" 등)으로 변환하는 함수 */
  const formatRelation = (relation: string) => {
    if (relation === "아버지") return "혼주 (부)";
    if (relation === "어머니") return "혼주 (모)";
    return relation; // '장남', '차녀' 등은 그대로 출력
  };

  const renderHeaderButton = (side: "groom" | "bride", title: string) => {
    const isOpen = openSide === side;

    return (
      <button 
        className={styles.groupHeaderBtn} 
        onClick={() => handleToggle(side)}
      >
        <span>{title}</span>
        <div className={styles.toggleWrapper}>
          <span className={styles.toggleText}>{isOpen ? "접기" : "열기"}</span>
          <img 
            src={getAssetPath("/icon/down.png")} 
            alt="토글 아이콘" 
            width={12} 
            height={12} 
            className={`${styles.toggleIconImg} ${isOpen ? styles.rotate : ""}`}
          />
        </div>
      </button>
    );
  };

  const renderMemberList = (members: FamilyMember[]) => {
    return members.map((member) => (
      <div key={member.id} className={styles.rowItem}>
        <div className={styles.info}>
          <span className={styles.relation}>{formatRelation(member.relation)}</span>
          <span className={styles.name}>
            {member.is_deceased && <span className={styles.deceasedMark}>故 </span>}
            {member.name}
          </span>
          {member.account_number && (
            <span className={styles.subText}>{member.bank_name} {member.account_number}</span>
          )}
        </div>
        <div className={styles.btnGroup}>
          {member.phone && (
            <>
              <a href={`tel:${member.phone}`} className={styles.miniBtn}>통화</a>
              <a href={`sms:${member.phone}`} className={styles.miniBtn}>문자</a>
            </>
          )}
          {member.account_number && (
            <button 
              className={styles.miniBtn}
              onClick={() => handleCopy(member.account_number!)}
            >
              계좌복사
            </button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <section className={styles.section}>
      {!isTerminalMode && (
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          
          <div className={styles.headerTag}>CONTACT & ACCOUNT</div>
          <h2 className={styles.mainTitle}>마음 전하실 곳</h2>

          <p className={styles.subDescription}>
            따뜻한 축하의 말씀을 전해주시는 분들께 감사드리며,<br />
            연락처와 함께 조심스럽게 마음 전하실 곳을 안내해 드립니다.
          </p>

          <div className={styles.contentWrapper}>
            
            {/* 신랑 측 통합 상자 */}
            <div className={styles.groupCard}>
              {renderHeaderButton("groom", "신랑 측 연락처 및 계좌번호")}
              
              <div 
                ref={groomContentRef}
                className={`${styles.accordionContent} ${openSide === "groom" ? styles.open : ""}`}
                style={{
                  maxHeight: openSide === "groom" ? `${groomContentRef.current?.scrollHeight}px` : "0px"
                }}
              >
                <div className={styles.innerList}>
                  {renderMemberList(groomMembers)}
                </div>
              </div>
            </div>

            {/* 신부 측 통합 상자 */}
            <div className={styles.groupCard}>
              {renderHeaderButton("bride", "신부 측 연락처 및 계좌번호")}
              
              <div 
                ref={brideContentRef}
                className={`${styles.accordionContent} ${openSide === "bride" ? styles.open : ""}`}
                style={{
                  maxHeight: openSide === "bride" ? `${brideContentRef.current?.scrollHeight}px` : "0px"
                }}
              >
                <div className={styles.innerList}>
                  {renderMemberList(brideMembers)}
                </div>
              </div>
            </div>

          </div>

        </motion.div>
      )}

      {isTerminalMode && (
        <motion.div 
          className={styles.terminalContainer}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </motion.div>
      )}
    </section>
  );
}