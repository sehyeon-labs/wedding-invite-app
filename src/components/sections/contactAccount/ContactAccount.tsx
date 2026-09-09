// src/components/sections/ContactAccount.tsx
"use client";

import { useState, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./ContactAccount.module.scss";

export default function ContactAccount() {
  const { groom, bride } = data;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [openSide, setOpenSide] = useState<string | null>(null);

  // 💡 각 아코디언 콘텐츠의 실제 DOM 요소를 참조하기 위한 ref
  const groomContentRef = useRef<HTMLDivElement>(null);
  const brideContentRef = useRef<HTMLDivElement>(null);

  const handleToggle = (side: string) => {
    setOpenSide(openSide === side ? null : side);
  };

  const handleCopy = (accountNumber: string, key: string) => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        <div className={styles.headerTag}>
          <span>// CONTACT & ACCOUNT.log</span>
        </div>

        <h2 className={styles.mainTitle}>마음 전하실 곳</h2>

        <p className={styles.subDescription}>
          따뜻한 축하의 말씀을 전해주시는 분들께 감사드리며,<br />
          연락처와 함께 조심스럽게 마음 전하실 곳을 안내해 드립니다.
        </p>

        <div className={styles.contentWrapper}>
          
          {/* 신랑 측 통합 상자 */}
          <div className={styles.groupCard}>
            <button 
              className={styles.groupHeaderBtn} 
              onClick={() => handleToggle("groom")}
            >
              <span>신랑 측 연락처 및 계좌번호</span>
              <span className={styles.toggleIcon}>{openSide === "groom" ? "[-] 접기" : "[+] 열기"}</span>
            </button>
            
            {/* 💡 동적 높이(scrollHeight) 인라인 스타일 적용 */}
            <div 
              ref={groomContentRef}
              className={`${styles.accordionContent} ${openSide === "groom" ? styles.open : ""}`}
              style={{
                maxHeight: openSide === "groom" ? `${groomContentRef.current?.scrollHeight}px` : "0px"
              }}
            >
              <div className={styles.innerList}>
                
                {/* 신랑 본인 */}
                <div className={styles.rowItem}>
                  <div className={styles.info}>
                    <span className={styles.relation}>신랑</span>
                    <span className={styles.name}>{groom.name}</span>
                    {groom.account?.number && (
                      <span className={styles.subText}>{groom.account.bank} {groom.account.number}</span>
                    )}
                  </div>
                  <div className={styles.btnGroup}>
                    {groom.phone && (
                      <>
                        <a href={`tel:${groom.phone}`} className={styles.miniBtn}>통화</a>
                        <a href={`sms:${groom.phone}`} className={styles.miniBtn}>문자</a>
                      </>
                    )}
                    {groom.account?.number && (
                      <button 
                        className={styles.miniBtn}
                        onClick={() => handleCopy(groom.account.number!, "groom_acc")}
                      >
                        {copiedKey === "groom_acc" ? "복사완료" : "계좌복사"}
                      </button>
                    )}
                  </div>
                </div>

                {/* 신랑 아버지 */}
                {groom.father && (
                  <div className={styles.rowItem}>
                    <div className={styles.info}>
                      <span className={styles.relation}>혼주 (부)</span>
                      <span className={styles.name}>
                        {groom.father.isDeceased && <span className={styles.deceasedMark}>故 </span>}
                        {groom.father.name}
                      </span>
                      {groom.father.account?.number && (
                        <span className={styles.subText}>{groom.father.account.bank} {groom.father.account.number}</span>
                      )}
                    </div>
                    <div className={styles.btnGroup}>
                      {groom.father.phone && (
                        <>
                          <a href={`tel:${groom.father.phone}`} className={styles.miniBtn}>통화</a>
                          <a href={`sms:${groom.father.phone}`} className={styles.miniBtn}>문자</a>
                        </>
                      )}
                      {groom.father.account?.number && (
                        <button 
                          className={styles.miniBtn}
                          onClick={() => handleCopy(groom.father.account!.number!, "groom_father_acc")}
                        >
                          {copiedKey === "groom_father_acc" ? "복사완료" : "계좌복사"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 신랑 어머니 */}
                {groom.mother && (
                  <div className={styles.rowItem}>
                    <div className={styles.info}>
                      <span className={styles.relation}>혼주 (모)</span>
                      <span className={styles.name}>
                        {groom.mother.isDeceased && <span className={styles.deceasedMark}>故 </span>}
                        {groom.mother.name}
                      </span>
                      {groom.mother.account?.number && (
                        <span className={styles.subText}>{groom.mother.account.bank} {groom.mother.account.number}</span>
                      )}
                    </div>
                    <div className={styles.btnGroup}>
                      {groom.mother.phone && (
                        <>
                          <a href={`tel:${groom.mother.phone}`} className={styles.miniBtn}>통화</a>
                          <a href={`sms:${groom.mother.phone}`} className={styles.miniBtn}>문자</a>
                        </>
                      )}
                      {groom.mother.account?.number && (
                        <button 
                          className={styles.miniBtn}
                          onClick={() => handleCopy(groom.mother.account!.number!, "groom_mother_acc")}
                        >
                          {copiedKey === "groom_mother_acc" ? "복사완료" : "계좌복사"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* 신부 측 통합 상자 */}
          <div className={styles.groupCard}>
            <button 
              className={styles.groupHeaderBtn} 
              onClick={() => handleToggle("bride")}
            >
              <span>신부 측 연락처 및 계좌번호</span>
              <span className={styles.toggleIcon}>{openSide === "bride" ? "[-] 접기" : "[+] 열기"}</span>
            </button>
            
            {/* 💡 동적 높이(scrollHeight) 인라인 스타일 적용 */}
            <div 
              ref={brideContentRef}
              className={`${styles.accordionContent} ${openSide === "bride" ? styles.open : ""}`}
              style={{
                maxHeight: openSide === "bride" ? `${brideContentRef.current?.scrollHeight}px` : "0px"
              }}
            >
              <div className={styles.innerList}>
                
                {/* 신부 본인 */}
                <div className={styles.rowItem}>
                  <div className={styles.info}>
                    <span className={styles.relation}>신부</span>
                    <span className={styles.name}>{bride.name}</span>
                    {bride.account?.number && (
                      <span className={styles.subText}>{bride.account.bank} {bride.account.number}</span>
                    )}
                  </div>
                  <div className={styles.btnGroup}>
                    {bride.phone && (
                      <>
                        <a href={`tel:${bride.phone}`} className={styles.miniBtn}>통화</a>
                        <a href={`sms:${bride.phone}`} className={styles.miniBtn}>문자</a>
                      </>
                    )}
                    {bride.account?.number && (
                      <button 
                        className={styles.miniBtn}
                        onClick={() => handleCopy(bride.account.number!, "bride_acc")}
                      >
                        {copiedKey === "bride_acc" ? "복사완료" : "계좌복사"}
                      </button>
                    )}
                  </div>
                </div>

                {/* 신부 아버지 */}
                {bride.father && (
                  <div className={styles.rowItem}>
                    <div className={styles.info}>
                      <span className={styles.relation}>혼주 (부)</span>
                      <span className={styles.name}>
                        {bride.father.isDeceased && <span className={styles.deceasedMark}>故 </span>}
                        {bride.father.name}
                      </span>
                      {bride.father.account?.number && (
                        <span className={styles.subText}>{bride.father.account.bank} {bride.father.account.number}</span>
                      )}
                    </div>
                    <div className={styles.btnGroup}>
                      {bride.father.phone && (
                        <>
                          <a href={`tel:${bride.father.phone}`} className={styles.miniBtn}>통화</a>
                          <a href={`sms:${bride.father.phone}`} className={styles.miniBtn}>문자</a>
                        </>
                      )}
                      {bride.father.account?.number && (
                        <button 
                          className={styles.miniBtn}
                          onClick={() => handleCopy(bride.father.account!.number!, "bride_father_acc")}
                        >
                          {copiedKey === "bride_father_acc" ? "복사완료" : "계좌복사"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 신부 어머니 */}
                {bride.mother && (
                  <div className={styles.rowItem}>
                    <div className={styles.info}>
                      <span className={styles.relation}>혼주 (모)</span>
                      <span className={styles.name}>
                        {bride.mother.isDeceased && <span className={styles.deceasedMark}>故 </span>}
                        {bride.mother.name}
                      </span>
                      {bride.mother.account?.number && (
                        <span className={styles.subText}>{bride.mother.account.bank} {bride.mother.account.number}</span>
                      )}
                    </div>
                    <div className={styles.btnGroup}>
                      {bride.mother.phone && (
                        <>
                          <a href={`tel:${bride.mother.phone}`} className={styles.miniBtn}>통화</a>
                          <a href={`sms:${bride.mother.phone}`} className={styles.miniBtn}>문자</a>
                        </>
                      )}
                      {bride.mother.account?.number && (
                        <button 
                          className={styles.miniBtn}
                          onClick={() => handleCopy(bride.mother.account!.number!, "bride_mother_acc")}
                        >
                          {copiedKey === "bride_mother_acc" ? "복사완료" : "계좌복사"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}