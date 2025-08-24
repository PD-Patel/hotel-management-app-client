export const getCurrentPayPeriod = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11
  const day = today.getDate();
  const start = new Date(
    year,
    month,
    day <= 15 ? 0 + month : month,
    day <= 15 ? 1 : 16
  );
  const end = new Date(
    year,
    month,
    day <= 15 ? 15 : new Date(year, month + 1, 0).getDate()
  );
  const toYmd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return { start: toYmd(start), end: toYmd(end) };
};

// export const getCurrentPayPeriod = async (siteId) => {
//   try {
//     const response = await api.post("/payroll/generate", { siteId });
//     return response.data;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
