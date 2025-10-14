<script setup>
</script>
<template>
    <main class="container py-4">
        <slot name="header"
         :title="title"
        >
            <header class="d-flex align-items-center justify-content-between mb-3">
                <h1 class="h3 m-0">{{ title }}</h1>
                <form class="d-none d-sm-flex" role="search">
                    <input class="form-control form-control-sm" type="search" placeholder="Search posts" />
                </form>
            </header>
        </slot>
        <slot name="content">

        </slot>

        <!-- Pagination -->
        <!-- <nav aria-label="Post navigation" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item disabled"><span class="page-link">Previous</span></li>
        <li class="page-item active" aria-current="page"><span class="page-link">1</span></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item"><a class="page-link" href="#">Next</a></li>
      </ul>
    </nav> -->
    </main>

</template>


<style scoped>
.success {
    color: green;
}

.error {
    color: red;
}

.post-excerpt {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.post-thumb {
    width: 120px;
    height: 80px;
    object-fit: cover;
    border-radius: .5rem;
}

@media (max-width: 575.98px) {
    .post-thumb {
        width: 100%;
        height: 160px;
    }
}
</style>