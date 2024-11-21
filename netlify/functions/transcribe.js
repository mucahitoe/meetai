exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Service temporarily unavailable" }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  };
};