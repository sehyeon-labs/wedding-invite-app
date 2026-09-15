// src/app/page.tsx
"use client";

import Cover from "@/components/sections/cover/Cover";
import Greeting from "@/components/sections/greeting/Greeting";
import Dday from "@/components/sections/dday/Dday";
import Gallery from "@/components/sections/gallery/Gallery";
import styles from "./page.module.scss";
import ContactAccount from "@/components/sections/contactAccount/ContactAccount";
import Reception from "@/components/sections/reception/Reception";
import Location from "@/components/sections/location/Location";
import Guestbook from "@/components/sections/guestbook/Guestbook";
import Rsvp from "@/components/sections/rsvp/Rsvp";
import GuestPhotoUpload from "@/components/sections/guestPhotoUpload/GuestPhotoUpload";

export default function Page() {

  return (
    <div className={styles.container}>

      <Cover />
      
      <Greeting />

      <Dday />

      <Gallery />

      <Location />

      <Reception />

      <ContactAccount />

      <Rsvp />

      <GuestPhotoUpload />

      <Guestbook />

    </div>
  );
}