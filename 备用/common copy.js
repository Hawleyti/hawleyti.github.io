// ========== 加载 nav.html ==========
document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.getElementById("replace_with_navbar");
    if (!navContainer) return;

    fetch("/common/nav.html")
        .then(res => {
            if (!res.ok) throw new Error(res.status);
            return res.text();
        })
        .then(html => {
            navContainer.innerHTML = html;
        })
        .catch(err => {
            console.error("加载 nav.html 失败", err);
        });
});


// ========== 搜索功能 ==========
async function handleSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const query = input.value.trim().toLowerCase();
    if (!query) return;

    const grid = document.querySelector(".grid");
    if (!grid) {
        console.warn("未找到 .grid，搜索终止");
        return;
    }

    const title = document.querySelector(".main-content h2");

    try {
        const res = await fetch("/common/data.json");
        if (!res.ok) throw new Error(res.status);

        const data = await res.json();

        const results = data.filter(item =>
            (item.name || "").toLowerCase().includes(query) ||
            (item.desc || "").toLowerCase().includes(query)
        );

        if (title) {
            title.innerText = `关于 "${query}" 的搜索结果`;
        }

        grid.innerHTML = "";

        if (!results.length) {
            grid.innerHTML =
                `<p style="width:100%;text-align:center;">抱歉，未找到相关内容。</p>`;
            return;
        }

        results.forEach(item => {
            grid.insertAdjacentHTML("beforeend", `
                <a href="${item.url}" class="card-link">
                    <div class="card">
                        <img src="${item.img}" alt="${item.name}">
                        <div class="card-body">
                            <h3>${item.name}</h3>
                            <p>${item.desc}</p>
                        </div>
                    </div>
                </a>
            `);
        });

    } catch (err) {
        console.error("搜索失败", err);
    }
}
