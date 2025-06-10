const StatCard = ({ title, value, color = "green" }) => (
  <div className={`p-4 rounded-lg shadow-lg bg-${color}-100`}>
    <h4 className="text-base font-medium">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default StatCard;
