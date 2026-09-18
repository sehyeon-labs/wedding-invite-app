"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import data from "@/data/mock.json";
import styles from "./ContactAccount.module.scss";

interface ContactAccountProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

export default function ContactAccount({ isTerminalMode, onCopyToast }: ContactAccountProps) {
  const { groom, bride } = data;
  const [openSide, setOpenSide] = useState<string | null>(null);

  const groomContentRef = useRef<HTMLDivElement>(null);
  const brideContentRef = useRef<HTMLDivElement>(null);

  const handleToggle = (side: string) => {
    setOpenSide(openSide === side ? null : side);
  };

  const handleCopy = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      // 💡 텍스트 변경 상태 없이 전역 토스트만 호출
      if (onCopyToast) {
        onCopyToast();
      }
    });
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
          <Image 
            src="/icon/down.png" 
            alt="토글 아이콘" 
            width={12} 
            height={12} 
            className={`${styles.toggleIconImg} ${isOpen ? styles.rotate : ""}`}
          />
        </div>
      </button>
    );
  };

  return (
    <section className={styles.section}>
      {!isTerminalMode && (
        <div className={styles.container}>
          
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
                          onClick={() => handleCopy(groom.account.number!)}
                        >
                          계좌복사
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
                            onClick={() => handleCopy(groom.father.account!.number!)}
                          >
                            계좌복사
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
                            onClick={() => handleCopy(groom.mother.account!.number!)}
                          >
                            계좌복사
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
              {renderHeaderButton("bride", "신부 측 연락처 및 계좌번호")}
              
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
                          onClick={() => handleCopy(bride.account.number!)}
                        >
                          계좌복사
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
                            onClick={() => handleCopy(bride.father.account!.number!)}
                          >
                            계좌복사
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
                            onClick={() => handleCopy(bride.mother.account!.number!)}
                          >
                            계좌복사
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
      )}

      {isTerminalMode && (
        <div className={styles.terminalContainer}>
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </div>
      )}
    </section>
  );
}