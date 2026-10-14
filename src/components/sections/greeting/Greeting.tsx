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
  isDeceased?: boolean;
}

interface GreetingData {
  title: string;
  content: string;
  groom: {
    name: string;
    relation: string;
    phone?: string;
    parents: ContactPerson[];
  };
  bride: {
    name: string;
    relation: string;
    phone?: string;
    parents: ContactPerson[];
  };
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

        const groomParents: ContactPerson[] = [];
        if (groomFather) {
          groomParents.push({
            role: "신랑 아버지",
            relationLabel: "아버지",
            name: groomFather.name,
            phone: groomFather.phone,
            isDeceased: groomFather.is_deceased,
          });
        }
        if (groomMother) {
          groomParents.push({
            role: "신랑 어머니",
            relationLabel: "어머니",
            name: groomMother.name,
            phone: groomMother.phone,
            isDeceased: groomMother.is_deceased,
          });
        }

        const brideParents: ContactPerson[] = [];
        if (brideFather) {
          brideParents.push({
            role: "신부 아버지",
            relationLabel: "아버지",
            name: brideFather.name,
            phone: brideFather.phone,
            isDeceased: brideFather.is_deceased,
          });
        }
        if (brideMother) {
          brideParents.push({
            role: "신부 어머니",
            relationLabel: "어머니",
            name: brideMother.name,
            phone: brideMother.phone,
            isDeceased: brideMother.is_deceased,
          });
        }

        setGreetingInfo({
          title: weddingData.greeting_title || "소중한 분들을 초대합니다",
          content: weddingData.greeting_content || "",
          groom: {
            name: groomMember?.name || "신랑",
            relation: groomMember?.relation || "장남",
            phone: groomMember?.phone,
            parents: groomParents,
          },
          bride: {
            name: brideMember?.name || "신부",
            relation: brideMember?.relation || "차녀",
            phone: brideMember?.phone,
            parents: brideParents,
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

              {/* 양가 혼주 & 신랑 신부 명단 표기 */}
              <div className={styles.namesContainer}>
                <div className={styles.nameRow}>
                  <span className={styles.parents}>
                    {renderParents(greetingInfo.groom.parents)}
                  </span>
                  <span className={styles.relation}>의 {greetingInfo.groom.relation}</span>
                  <span className={styles.name}>{greetingInfo.groom.name}</span>
                </div>

                <div className={styles.nameRow}>
                  <span className={styles.parents}>
                    {renderParents(greetingInfo.bride.parents)}
                  </span>
                  <span className={styles.relation}>의 {greetingInfo.bride.relation}</span>
                  <span className={styles.name}>{greetingInfo.bride.name}</span>
                </div>
              </div>

              {/* 연락하기 트리거 버튼 */}
              <div className={styles.contactBtnWrapper}>
                <button
                  type="button"
                  className={styles.contactOpenBtn}
                  onClick={() => setIsContactModalOpen(true)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>연락처 보기</span>
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
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>축하 연락처</h3>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setIsContactModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className={styles.contactList}>
                {/* 신랑측 */}
                <div className={styles.sideBlock}>
                  <div className={styles.sideLabel}>신랑측</div>
                  
                  {/* 신랑 본인 */}
                  <div className={styles.personRow}>
                    <div className={styles.personInfo}>
                      <span className={styles.personRole}>신랑</span>
                      <span className={styles.personName}>{greetingInfo.groom.name}</span>
                    </div>
                    {greetingInfo.groom.phone && (
                      <div className={styles.actionBtns}>
                        <a href={`tel:${greetingInfo.groom.phone}`} className={styles.actionBtn} aria-label="전화">
                          전화
                        </a>
                        <a href={`sms:${greetingInfo.groom.phone}`} className={styles.actionBtn} aria-label="문자">
                          문자
                        </a>
                      </div>
                    )}
                  </div>

                  {/* 신랑 혼주 */}
                  {greetingInfo.groom.parents.map((p, idx) => (
                    <div key={idx} className={styles.personRow}>
                      <div className={styles.personInfo}>
                        <span className={styles.personRole}>{p.relationLabel}</span>
                        <span className={styles.personName}>
                          {p.isDeceased && <span className={styles.deceasedMark}>故 </span>}
                          {p.name}
                        </span>
                      </div>
                      {!p.isDeceased && p.phone && (
                        <div className={styles.actionBtns}>
                          <a href={`tel:${p.phone}`} className={styles.actionBtn}>전화</a>
                          <a href={`sms:${p.phone}`} className={styles.actionBtn}>문자</a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.contactDivider} />

                {/* 신부측 */}
                <div className={styles.sideBlock}>
                  <div className={styles.sideLabel}>신부측</div>

                  {/* 신부 본인 */}
                  <div className={styles.personRow}>
                    <div className={styles.personInfo}>
                      <span className={styles.personRole}>신부</span>
                      <span className={styles.personName}>{greetingInfo.bride.name}</span>
                    </div>
                    {greetingInfo.bride.phone && (
                      <div className={styles.actionBtns}>
                        <a href={`tel:${greetingInfo.bride.phone}`} className={styles.actionBtn}>전화</a>
                        <a href={`sms:${greetingInfo.bride.phone}`} className={styles.actionBtn}>문자</a>
                      </div>
                    )}
                  </div>

                  {/* 신부 혼주 */}
                  {greetingInfo.bride.parents.map((p, idx) => (
                    <div key={idx} className={styles.personRow}>
                      <div className={styles.personInfo}>
                        <span className={styles.personRole}>{p.relationLabel}</span>
                        <span className={styles.personName}>
                          {p.isDeceased && <span className={styles.deceasedMark}>故 </span>}
                          {p.name}
                        </span>
                      </div>
                      {!p.isDeceased && p.phone && (
                        <div className={styles.actionBtns}>
                          <a href={`tel:${p.phone}`} className={styles.actionBtn}>전화</a>
                          <a href={`sms:${p.phone}`} className={styles.actionBtn}>문자</a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}