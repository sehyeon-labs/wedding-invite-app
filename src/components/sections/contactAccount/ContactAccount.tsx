"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function ContactAccount({ isTerminalMode, onCopyToast }: ContactAccountProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [openSide, setOpenSide] = useState<"groom" | "bride" | null>(null);

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

  const handleToggle = (side: "groom" | "bride") => {
    setOpenSide(openSide === side ? null : side);
  };

  const handleCopy = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      if (onCopyToast) {
        onCopyToast();
      }
    });
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

  const renderAccountCard = (side: "groom" | "bride", title: string, members: FamilyMember[]) => {
    const isOpen = openSide === side;

    return (
      <div className={`${styles.accordionCard} ${isOpen ? styles.cardOpen : ""}`}>
        <button
          type="button"
          className={styles.headerBtn}
          onClick={() => handleToggle(side)}
        >
          <span className={styles.sideTitle}>{title}</span>
          <div className={styles.toggleState}>
            <span className={styles.stateLabel}>{isOpen ? "닫기" : "확인하기"}</span>
            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={styles.chevron}
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={styles.contentDrawer}
            >
              <div className={styles.memberList}>
                {members.map((member) => (
                  <div key={member.id} className={styles.memberRow}>
                    <div className={styles.infoArea}>
                      <div className={styles.primaryInfo}>
                        <span className={styles.badge}>{formatRelation(member.relation)}</span>
                        <span className={styles.memberName}>
                          {member.is_deceased && <span className={styles.deceasedMark}>故 </span>}
                          {member.name}
                        </span>
                        {!member.is_deceased && member.holder_name && member.holder_name !== member.name && (
                          <span className={styles.holderTag}>(예금주: {member.holder_name})</span>
                        )}
                      </div>

                      {!member.is_deceased && member.account_number && (
                        <div className={styles.accountLine}>
                          <span className={styles.bankName}>{member.bank_name}</span>
                          <span className={styles.accountNumber}>{member.account_number}</span>
                        </div>
                      )}
                    </div>

                    {!member.is_deceased && member.account_number && (
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => handleCopy(member.account_number!)}
                      >
                        복사
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

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
          viewport={{ once: true, margin: "0px 0px -80px 0px", amount: 0.2 }}
        >
          <motion.div className={styles.headerTag} variants={itemVariants}>
            ACCOUNT
          </motion.div>

          <motion.h2 className={styles.mainTitle} variants={itemVariants}>
            마음 전하실 곳
          </motion.h2>

          <motion.p className={styles.subDescription} variants={itemVariants}>
            축복해 주시는 따뜻한 마음만으로도 충분히 감사하지만,<br />
            참석이 어려워 마음 전하고자 하시는 분들을 위해<br />
            계좌번호를 함께 안내해 드립니다.
          </motion.p>

          <motion.div className={styles.cardGroup} variants={itemVariants}>
            {groomMembers.length > 0 && renderAccountCard("groom", "신랑측 계좌번호", groomMembers)}
            {brideMembers.length > 0 && renderAccountCard("bride", "신부측 계좌번호", brideMembers)}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}