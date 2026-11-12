"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { copyToClipboard } from "@/utils/format";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import Modal from "@/components/common/modal/Modal";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import styles from "./ContactAccount.module.scss";
import TerminalAccount from "@/components/developer/TerminalAccount/TerminalAccount";

interface ContactAccountProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

interface FamilyMember {
  id: string;
  role_type: string;
  name: string;
  relation: string;
  is_deceased: boolean;
  bank_name: string | null;
  account_number: string | null;
  holder_name: string | null;
}

const ROLE_ORDER: Record<string, number> = {
  groom: 1,
  groom_father: 2,
  groom_mother: 3,
  bride: 1,
  bride_father: 2,
  bride_mother: 3,
};

/** 신랑측/신부측 혼주·당사자 계좌번호 섹션 */
export default function ContactAccount({ isTerminalMode, onCopyToast }: ContactAccountProps) {
  const [openSide, setOpenSide] = useState<"groom" | "bride" | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    async function fetchFamilyMembers() {
      try {
        const { data, error } = await supabase
          .from("wedding_family_members")
          .select("id, role_type, name, relation, is_deceased, bank_name, account_number, holder_name");

        if (error) throw error;
        if (data) {
          setFamilyMembers(data);
        }
      } catch (error) {
        console.error("계좌 정보 데이터 조회 실패:", error);
      }
    }

    fetchFamilyMembers();
  }, []);

  const handleCopy = async (accountNumber: string) => {
    if (await copyToClipboard(accountNumber)) onCopyToast?.();
  };

  const sortMembers = (members: FamilyMember[]) => {
    return [...members].sort((a, b) => {
      const orderA = ROLE_ORDER[a.role_type] || 99;
      const orderB = ROLE_ORDER[b.role_type] || 99;
      return orderA - orderB;
    });
  };

  const groomMembers = sortMembers(
    familyMembers.filter((m) => m.role_type && m.role_type.startsWith("groom"))
  );
  const brideMembers = sortMembers(
    familyMembers.filter((m) => m.role_type && m.role_type.startsWith("bride"))
  );

  const formatRelation = (relation: string) => {
    if (relation === "아버지") return "혼주 (부)";
    if (relation === "어머니") return "혼주 (모)";
    return relation;
  };

  /** 한쪽(신랑측/신부측)의 계좌 목록 */
  const renderMembers = (members: FamilyMember[]) => (
    <div className={styles.memberList}>
      {members.map((member) => {
        const hasAccount = !member.is_deceased && !!member.account_number;
        const holder = member.holder_name && member.holder_name !== member.name ? member.holder_name : "";

        return (
          <div key={member.id} className={styles.memberRow}>
            <div className={styles.info}>
              <div className={styles.memberHead}>
                <span className={styles.relation}>{formatRelation(member.relation)}</span>
                <span className={styles.memberName}>
                  {member.is_deceased && <span className={styles.deceasedMark}>故 </span>}
                  {member.name}
                </span>
              </div>
              {hasAccount && (
                <>
                  <div className={styles.accountLine}>
                    <span className={styles.bankName}>{member.bank_name}</span>
                    <span className={styles.accountNumber}>{member.account_number}</span>
                  </div>
                  {holder && <span className={styles.holderLine}>예금주 {holder}</span>}
                </>
              )}
            </div>

            {hasAccount && (
              <button type="button" className={styles.copyBtn} onClick={() => handleCopy(member.account_number!)}>
                복사
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  const SIDES = [
    { side: "groom" as const, title: "신랑측 계좌번호", members: groomMembers },
    { side: "bride" as const, title: "신부측 계좌번호", members: brideMembers },
  ];

  if (!familyMembers.length && !isTerminalMode) return null;

  return (
    <section className={styles.section}>
      {isTerminalMode ? (
        <TerminalAccount />
      ) : (
        <motion.div
          className={styles.container}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <SectionHeader tag="ACCOUNT" title="마음 전하실 곳" />

          <motion.div className={styles.cardGroup} variants={itemVariants}>
            {SIDES.map(({ side, title, members }) =>
              members.length > 0 ? (
                <button key={side} type="button" className={styles.sideBtn} onClick={() => setOpenSide(side)}>
                  <span>{title}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              ) : null
            )}
          </motion.div>

          {SIDES.map(({ side, title, members }) => (
            <Modal key={side} isOpen={openSide === side} onClose={() => setOpenSide(null)} title={title} placement="bottom">
              {renderMembers(members)}
            </Modal>
          ))}
        </motion.div>
      )}
    </section>
  );
}