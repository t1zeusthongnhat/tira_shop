import styles from "./styles.module.scss";

export default function Sneaker() {
  return (
    <div>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <a href="#" className={styles.title_name}>
            Explore Men`s Sneakers
          </a>
        </h1>

        <h1 className={styles.title}>
          <a href="#" className={styles.title_name}>
            Men`s Gucci Cub3d Snearkers
          </a>
        </h1>
      </div>
    </div>
  );
}
