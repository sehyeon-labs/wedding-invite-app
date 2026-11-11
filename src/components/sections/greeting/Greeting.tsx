"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Greeting.module.scss";
import TerminalGreeting from "@/components/developer/TerminalGreeting/TerminalGreeting";

interface GreetingProps {
  isTerminalMode: boolean;
}

interface ContactPerson {
  role: string;
  relationLabel: string;
  name: string;
  phone?: string;
  kakaoId?: string;
  isDeceased?: boolean;
}

interface SideData {
  name: string;
  relation: string;
  phone?: string;
  kakaoId?: string;
  parents: ContactPerson[];
}

interface GreetingData {
  title: string;
  content: string;
  groom: SideData;
  bride: SideData;
}

export default function Greeting({ isTerminalMode }: GreetingProps) {
  const [greetingInfo, setGreetingInfo] = useState<GreetingData | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    async function fetchGreetingData() {
      try {
        const { data: weddingData, error: weddingError } = await supabase
          .from("weddings")
          .select("id, greeting_title, greeting_content")
          .limit(1)
          .single();

        if (weddingError) throw weddingError;

        const { data: familyData, error: familyError } = await supabase
          .from("wedding_family_members")
          .select("*")
          .eq("wedding_id", weddingData.id);

        if (familyError) throw familyError;

        const members = (familyData || []) as any[];
        const groomMember = members.find((m) => m.role_type === "groom");
        const brideMember = members.find((m) => m.role_type === "bride");

        const groomFather = members.find((m) => m.role_type === "groom_father");
        const groomMother = members.find((m) => m.role_type === "groom_mother");
        const brideFather = members.find((m) => m.role_type === "bride_father");
        const brideMother = members.find((m) => m.role_type === "bride_mother");

        const createParents = (father: any, mother: any, sideRole: string) => {
          const list: ContactPerson[] = [];
          if (father) {
            list.push({
              role: `${sideRole} 아버지`,
              relationLabel: "아버지",
              name: father.name,
              phone: father.phone,
              kakaoId: father.kakao_id,
              isDeceased: father.is_deceased,
            });
          }
          if (mother) {
            list.push({
              role: `${sideRole} 어머니`,
              relationLabel: "어머니",
              name: mother.name,
              phone: mother.phone,
              kakaoId: mother.kakao_id,
              isDeceased: mother.is_deceased,
            });
          }
          return list;
        };

        setGreetingInfo({
          title: weddingData.greeting_title || "소중한 분들을 초대합니다",
          content: weddingData.greeting_content || "",
          groom: {
            name: groomMember?.name || "신랑",
            relation: groomMember?.relation || "장남",
            phone: groomMember?.phone,
            kakaoId: groomMember?.kakao_id,
            parents: createParents(groomFather, groomMother, "신랑"),
          },
          bride: {
            name: brideMember?.name || "신부",
            relation: brideMember?.relation || "차녀",
            phone: brideMember?.phone,
            kakaoId: brideMember?.kakao_id,
            parents: createParents(brideFather, brideMother, "신부"),
          },
        });
      } catch (error) {
        console.error("인사말 데이터 조회 실패:", error);
      }
    }

    fetchGreetingData();
  }, []);

  const renderParents = (parents: ContactPerson[]) => {
    if (!parents || parents.length === 0) return null;
    return parents.map((parent, index) => (
      <span key={index}>
        {index > 0 && " · "}
        {parent.isDeceased && <span className={styles.deceasedMark}>故 </span>}
        {parent.name}
      </span>
    ));
  };

  const getKakaoLink = (kakaoId: string) => `kakaotalk://search?q=${encodeURIComponent(kakaoId)}`;

  // 인원별 연락처 행을 렌더링하는 공통 함수 (코드 간소화)
  const renderPersonRow = (role: string, name: string, phone?: string, kakaoId?: string, isDeceased?: boolean) => (
    <div className={styles.personRow} key={`${role}-${name}`}>
      <div className={styles.personInfo}>
        <span className={styles.personRole}>{role}</span>
        <span className={styles.personName}>
          {isDeceased && <span className={styles.deceasedMark}>故 </span>}
          {name}
        </span>
      </div>
      {!isDeceased && (
        <div className={styles.actionBtns}>
          {kakaoId && (
            <a href={getKakaoLink(kakaoId)} className={`${styles.actionBtn} ${styles.kakaoBtn}`}>
              카카오톡
            </a>
          )}
          {phone && (
            <>
              <a href={`tel:${phone}`} className={styles.actionBtn}>
                전화
              </a>
              <a href={`sms:${phone}`} className={styles.actionBtn}>
                문자
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className={styles.greetingSection}>
      {isTerminalMode ? (
        <TerminalGreeting />
      ) : (
        greetingInfo && (
          <motion.div
            className={styles.normalContainer}
            initial={{ opacity: 0, y: 16, filter: "blur(2px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "0px 0px -90px 0px", amount: 0.25 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.normalContentWrapper}>
              <span className={styles.quoteMark}>“</span>
              <h2 className={styles.normalTitle}>{greetingInfo.title}</h2>
              <p className={styles.normalContent}>{greetingInfo.content}</p>

              {/* 혼주 & 자녀 명단 */}
              <div className={styles.namesContainer}>
                <div className={styles.nameRow}>
                  <span className={styles.parents}>{renderParents(greetingInfo.groom.parents)}</span>
                  <span className={styles.relation}>의 {greetingInfo.groom.relation}</span>
                  <span className={styles.name}>{greetingInfo.groom.name}</span>
                </div>
                <div className={styles.nameRow}>
                  <span className={styles.parents}>{renderParents(greetingInfo.bride.parents)}</span>
                  <span className={styles.relation}>의 {greetingInfo.bride.relation}</span>
                  <span className={styles.name}>{greetingInfo.bride.name}</span>
                </div>
              </div>

              {/* 연락하기 열기 버튼 */}
              <div className={styles.contactBtnWrapper}>
                <button
                  type="button"
                  className={styles.contactOpenBtn}
                  onClick={() => setIsContactModalOpen(true)}
                >
                  <span>연락하기</span>
                </button>
              </div>
            </div>
          </motion.div>
        )
      )}

      {/* 연락하기 바텀시트 모달 */}
      <AnimatePresence>
        {isContactModalOpen && greetingInfo && (
          <div className={styles.modalOverlay} onClick={() => setIsContactModalOpen(false)}>
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>연락하기</h3>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setIsContactModalOpen(false)}
                  aria-label="닫기"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.contactList}>
                {/* 신랑측 */}
                <div className={styles.sideBlock}>
                  <div className={styles.sideLabel}>GROOM SIDE</div>
                  {renderPersonRow("신랑", greetingInfo.groom.name, greetingInfo.groom.phone, greetingInfo.groom.kakaoId)}
                  {greetingInfo.groom.parents.map((p) =>
                    renderPersonRow(p.relationLabel, p.name, p.phone, p.kakaoId, p.isDeceased)
                  )}
                </div>

                <div className={styles.contactDivider} />

                {/* 신부측 */}
                <div className={styles.sideBlock}>
                  <div className={styles.sideLabel}>BRIDE SIDE</div>
                  {renderPersonRow("신부", greetingInfo.bride.name, greetingInfo.bride.phone, greetingInfo.bride.kakaoId)}
                  {greetingInfo.bride.parents.map((p) =>
                    renderPersonRow(p.relationLabel, p.name, p.phone, p.kakaoId, p.isDeceased)
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}