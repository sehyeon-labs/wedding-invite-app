"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Greeting.module.scss";

interface GreetingProps {
  isTerminalMode: boolean;
}

interface ParentInfo {
  name: string;
  isDeceased?: boolean;
}

interface FamilyMemberRow {
  role_type: string;
  name: string;
  relation?: string;
  is_deceased?: boolean;
}

interface GreetingData {
  title: string;
  content: string;
  groom: {
    name: string;
    relation: string;
    parents: ParentInfo[];
  };
  bride: {
    name: string;
    relation: string;
    parents: ParentInfo[];
  };
}

/**
 * 인사말 및 혼주 정보를 렌더링하는 섹션 컴포넌트
 */
export default function Greeting({ isTerminalMode }: GreetingProps) {
  const [greetingInfo, setGreetingInfo] = useState<GreetingData | null>(null);

  /** Supabase에서 인사말 및 가족 구성원(혼주/신랑신부) 데이터 조회 */
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

        const members = familyData as FamilyMemberRow[];
        const groomMember = members.find((m) => m.role_type === "groom");
        const brideMember = members.find((m) => m.role_type === "bride");
        
        const groomFather = members.find((m) => m.role_type === "groom_father");
        const groomMother = members.find((m) => m.role_type === "groom_mother");
        const brideFather = members.find((m) => m.role_type === "bride_father");
        const brideMother = members.find((m) => m.role_type === "bride_mother");

        const groomParents: ParentInfo[] = [];
        if (groomFather) groomParents.push({ name: groomFather.name, isDeceased: groomFather.is_deceased });
        if (groomMother) groomParents.push({ name: groomMother.name, isDeceased: groomMother.is_deceased });

        const brideParents: ParentInfo[] = [];
        if (brideFather) brideParents.push({ name: brideFather.name, isDeceased: brideFather.is_deceased });
        if (brideMother) brideParents.push({ name: brideMother.name, isDeceased: brideMother.is_deceased });

        setGreetingInfo({
          title: weddingData.greeting_title || "소중한 분들을 초대합니다",
          content: weddingData.greeting_content || "",
          groom: {
            name: groomMember?.name || "신랑",
            relation: groomMember?.relation || "장남",
            parents: groomParents,
          },
          bride: {
            name: brideMember?.name || "신부",
            relation: brideMember?.relation || "차녀",
            parents: brideParents,
          },
        });
      } catch (error) {
        console.error("Failed to fetch greeting data from Supabase:", error);
      }
    }

    fetchGreetingData();
  }, []);

  /** 부모님 성함 목록 렌더링 (고인 표기 및 가운데 점 연결) */
  const renderParents = (parents: ParentInfo[]) => {
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
      {/* 일반 모드 */}
      {!isTerminalMode && greetingInfo && (
        <motion.div 
          className={styles.normalContainer}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.normalContentWrapper}>
            <span className={styles.quoteMark}>“</span>
            <h2 className={styles.normalTitle}>{greetingInfo.title}</h2>
            <p className={styles.normalContent}>{greetingInfo.content}</p>

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
          </div>
        </motion.div>
      )}

      {/* 개발자 모드 */}
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