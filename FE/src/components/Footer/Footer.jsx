import styles from "./styles.module.scss";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { useEffect, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

function Footer() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Initialize simple map
  useEffect(() => {
    goongjs.accessToken = 'qM35eQ7w1or6MWNEoAXQPUQDZwIdeljIPEGaxdkF';

    mapInstance.current = new goongjs.Map({
      container: mapRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [105.7478, 21.0381], // BTEC FPT, Trịnh Văn Bô coordinates
      zoom: 15,
    });

    // Add a marker at BTEC FPT
    new goongjs.Marker()
      .setLngLat([105.7478, 21.0381])
      .addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) mapInstance.current.remove();
    };
  }, []);

  return (
    <>
      {/* Khối màu đỏ phía trên footer */}
      <div className={styles.preFooter}>
        <div className={styles.preFooterContainer}>
          <div className={styles.preFooterIntro}>
            <h2 className={styles.preFooterLogo}>TIRA SHOP</h2>
            <p className={styles.preFooterText}>
              Tira Shop is proud to be the leading high-end fashion distributor in Vietnam, bringing customers quality products from famous brands such as Playboy, True Religion, CPTN Apparel, Jungles, ALLSAINTS,... . With the mission of bringing modern and sophisticated fashion styles, Tira Shop is committed to providing the best service, from consulting to fast delivery. We always respect our customers and constantly strive to bring the best shopping experience.
            </p>
          </div>
        </div>
      </div>

      {/* Footer hiện tại */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          {/* Cột 1 - Hỗ trợ khách hàng */}
          <div className={styles.footerColumn}>
            <h2 className={styles.footerTitle}>Customer Service</h2>
            <ul className={styles.footerList}>
              <li><a href="/contact" className={styles.footerLink}>Contact Us</a></li>
              <li><a href="/orders" className={styles.footerLink}>Track Your Order</a></li>
              <li><a href="/faqs" className={styles.footerLink}>FAQs</a></li>
              <li><a href="/shipping" className={styles.footerLink}>Shipping & Returns</a></li>
              <li><a href="/sitemap" className={styles.footerLink}>Sitemap</a></li>
            </ul>
          </div>

          {/* Cột 2 - Thông tin công ty */}
          <div className={styles.footerColumn}>
            <h2 className={styles.footerTitle}>About Tira Shop</h2>
            <ul className={styles.footerList}>
              <li><a href="/about" className={styles.footerLink}>Our Story</a></li>
              <li><a href="/careers" className={styles.footerLink}>Careers</a></li>
              <li><a href="/sustainability" className={styles.footerLink}>Sustainability</a></li>
              <li><a href="/terms" className={styles.footerLink}>Terms & Conditions</a></li>
              <li><a href="/privacy" className={styles.footerLink}>Privacy Policy</a></li>
            </ul>
          </div>

          {/* Cột 3 - Kết nối */}
          <div className={styles.footerColumn}>
            <h2 className={styles.footerTitle}>Connect With Us</h2>
            <div className={styles.socialIcons}>
              <a href="https://facebook.com" className={styles.socialLink}><FaFacebookF /></a>
              <a href="https://twitter.com" className={styles.socialLink}><FaTwitter /></a>
              <a href="https://instagram.com" className={styles.socialLink}><FaInstagram /></a>
              <a href="https://youtube.com" className={styles.socialLink}><FaYoutube /></a>
            </div>
          </div>

          {/* Cột 4 - Bản đồ */}
          <div className={styles.footerColumn}>
            <h2 className={styles.footerTitle}>Our Location</h2>
            <div ref={mapRef} className={styles.footerMap} />
            <p className={styles.footerText}>
              BTEC FPT, Duong Trinh Van Bo, Xuan Phuong, Nam Tu Liem, Ha Noi, Viet Nam
            </p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContainer}>
            <p className={styles.footerCopyright}>
              © {new Date().getFullYear()} Tira Shop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;