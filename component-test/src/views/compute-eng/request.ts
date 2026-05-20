export function getDetail() {
  return new Promise((resolve, reject) => {
    // resolve({
    //   nodes : [],
    //   edges : [],
    //   configs : {}
    // })
    const data = JSON.parse(
      localStorage.getItem("compute-data") ||
        JSON.stringify({ nodes: [], edges: [], configs: {} }),
    );
    resolve(data);
  });
}
