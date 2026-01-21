
    async function handleSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsContainer = document.querySelector('.grid');
    const sectionTitle = document.querySelector('.main-content h2'); // 获取“热门推荐”那个标题

    if (!query) return;

    try {
        const response = await fetch('data.json');
        const allData = await response.json();

        const filteredData = allData.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.desc.toLowerCase().includes(query)
        );

        // --- 关键修改点 ---
        sectionTitle.innerText = `关于 "${query}" 的搜索结果`; // 修改标题文本
        resultsContainer.innerHTML = ''; // 彻底清空推荐内容
        // ----------------

        if (filteredData.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align:center; width:100%;">抱歉，未找到相关内容。</p>';
            return;
        }

        filteredData.forEach(item => {
            resultsContainer.innerHTML += `
                <a href="${item.url}" class="card-link">
                    <div class="card">
                        <img src="${item.img}" alt="${item.name}">
                        <div class="card-body">
                            <h3>${item.name}</h3>
                            <p>${item.desc}</p>
                        </div>
                    </div>
                </a>`;
        });
    } catch (e) {
        console.error("搜索失败", e);
    }
}
