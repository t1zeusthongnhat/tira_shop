import styles from "./styles.module.scss";

function MyFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Cột 1 */}
        <div className={styles.footerColumn}>
          <h2 className={styles.footerTitle}>May We Help You?</h2>
          <ul className={styles.footerList}>
            <li>
              <a href="#" className={styles.footerLink}>
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                My Order
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                FAQs
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                Email Unsubscribe
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                Sitemap
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 2 */}
        <div className={styles.footerColumn}>
          <h2 className={styles.footerTitle}>The Company</h2>
          <ul className={styles.footerList}>
            <li>
              <a href="#" className={styles.footerLink}>
                About Tira
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                Code of Ethics
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                Careers
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                Legal
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                Privacy & Cookie Policy
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                Cookie Settings
              </a>
            </li>
            <li>
              <a href="#" className={styles.footerLink}>
                Corporate Information
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 3 */}
        <div className={styles.footerColumn}>
          <h2 className={styles.footerTitle}>Store Locator</h2>
          <p className={styles.footerText}>Country/Region, City</p>
          <h2 className={styles.footerTitle}>Sign Up for Gucci Updates</h2>
          <p className={styles.footerText}>
            By entering your email address below, you consent to receiving our
            newsletter with access to our latest collections, events and
            initiatives. More details on this are provided in our{" "}
            <a href="#" className={styles.footerLink}>
              Privacy Policy
            </a>
            .
          </p>
          <div className={styles.emailInputContainer}>
            <input
              type="email"
              placeholder="Email"
              className={styles.emailInput}
            />
            <button className={styles.submitButton}>Submit</button>
          </div>
          <h2 className={styles.footerTitle}>Country/Region</h2>
          <p className={styles.footerTextBold}>United States</p>
        </div>
      </div>
    </footer>
  );
}

export default MyFooter;
