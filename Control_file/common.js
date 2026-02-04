// ========== 加载 nav.html ==========
document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.getElementById("replace_with_navbar");
    if (!navContainer) return;

    fetch("../common/nav.html")
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


// ========== 搜索函数 ==========
async function handleSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const query = input.value.trim().toLowerCase();
    if (!query) return;

    try {
        const res = await fetch("../common/data.json");
        if (!res.ok) throw new Error(res.status);

        const data = await res.json();
      const results = data.filter(item => {
    const name = (item.name || "").toLowerCase();
    const desc = (item.desc || "").toLowerCase();

    // keywords 可能不存在，所以要做保护
    const keywords = Array.isArray(item.keywords)
        ? item.keywords.join(" ").toLowerCase()
        : "";

    return (
        name.includes(query) ||
        desc.includes(query) ||
        keywords.includes(query)
    );
});

        showSearchModal(query, results);

    } catch (err) {
        console.error("搜索失败", err);
        showSearchModal(query, [], true);
    }
}


// ========== 弹窗渲染（带柔和淡入淡出动画） ==========
function showSearchModal(query, results, isError = false) {
    // 移除已有弹窗
    const oldModal = document.getElementById("search-modal");
    if (oldModal) oldModal.remove();

    // 禁止页面滚动
    document.body.style.overflow = "hidden";

    // 遮罩层
    const overlay = document.createElement("div");
    overlay.id = "search-modal";
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0);   /* 初始透明，便于淡入 */
        backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
        z-index: 1001;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        transition: background 0.4s ease, backdrop-filter 0.4s ease;
        padding-top: 60px; /* 顶部偏下显示 */
    `;

    // 弹窗主体
    const modal = document.createElement("div");
    modal.style.cssText = `
        width: 80%;
        max-width: 800px;
        max-height: 80%;
        background: #fff;
        border-radius: 8px;
        position: relative;
        overflow: hidden;
        opacity: 0;
        transform: translateY(-30px);
        transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1);
    `;
    modal.addEventListener("click", e => e.stopPropagation()); // 阻止冒泡

    // 弹窗内容
    modal.innerHTML = `
        <div style="
            padding: 12px 16px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <strong>搜索结果：${query}</strong>
            <button id="close-search-modal"
                style="border:none;background:none;font-size:20px;cursor:pointer;">×</button>
        </div>
        <div id="search-modal-body" style="
            padding: 16px;
            overflow: auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
        "></div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const body = modal.querySelector("#search-modal-body");

    // 延迟一帧触发淡入动画
    requestAnimationFrame(() => {
        overlay.style.background = "rgba(0,0,0,0.6)";
        overlay.style.backdropFilter = "blur(6px)";
        modal.style.opacity = "1";
        modal.style.transform = "translateY(0)";
    });

    // 关闭函数（淡出动画）
    const closeModal = () => {
        overlay.style.background = "rgba(0,0,0,0)";
        overlay.style.backdropFilter = "blur(0px)";
        modal.style.opacity = "0";
        modal.style.transform = "translateY(-30px)";

        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = ""; // 恢复滚动
            document.removeEventListener("keydown", escListener);
        }, 400); // 与 transition 时间一致
    };

    // 点击遮罩关闭
    overlay.addEventListener("click", closeModal);

    // 点击 × 按钮关闭
    modal.querySelector("#close-search-modal").onclick = closeModal;

    // 按 ESC 键关闭
    const escListener = (e) => {
        if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", escListener);

    // 错误 / 无结果处理
    if (isError) {
        body.innerHTML = `<p>搜索失败，请稍后再试。</p>`;
        return;
    }
    if (!results.length) {
        body.innerHTML = `<p>未找到与 “${query}” 相关的内容。</p>`;
        return;
    }
    

    // 渲染搜索结果
    results.forEach(item => {
        const card = document.createElement("a");
        card.href = item.url;
        card.className = "card-link";
        card.innerHTML = `
            <div class="card">
                <img src="${item.img}" alt="${item.name}">
                <div class="card-body">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                </div>
            </div>
        `;
        body.appendChild(card);
    });
}



function openModal(element) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("fullImage");
    var captionText = document.getElementById("captionText");
    
    modal.style.display = "block"; // 显示模态框
    modalImg.src = element.src;    // 将点击图片的 src 传给大图
    
    // 自动抓取对应的 figcaption 文字作为标题
    var caption = element.parentElement.querySelector('figcaption');
    if(caption) {
        captionText.innerHTML = caption.innerHTML;
    }
}

function closeModal() {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none"; // 隐藏模态框
}


// 轮播图片控制区
document.addEventListener('DOMContentLoaded', function() {
    const slide = document.querySelector('.carousel-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentOffset = 0;

    function updateSlide() {
        slide.style.transform = `translateX(${currentOffset}px)`;
    }

    nextBtn.addEventListener('click', () => {
        const containerWidth = document.querySelector('.carousel-container').offsetWidth;
        // 计算最大可向左滚动的距离
        const maxScroll = slide.scrollWidth - containerWidth;
        
        // 每次点击滚动容器宽度的 70%，保证流畅感
        currentOffset -= containerWidth * 0.7;
        
        if (Math.abs(currentOffset) > maxScroll) {
            currentOffset = -maxScroll;
        }
        updateSlide();
    });

    prevBtn.addEventListener('click', () => {
        const containerWidth = document.querySelector('.carousel-container').offsetWidth;
        
        currentOffset += containerWidth * 0.7;
        
        if (currentOffset > 0) {
            currentOffset = 0;
        }
        updateSlide();
    });
});