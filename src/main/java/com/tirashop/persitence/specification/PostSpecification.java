package com.tirashop.persitence.specification;

import com.tirashop.persitence.entity.Post;
import com.tirashop.persitence.entity.Post.Fields;
import com.tirashop.persitence.entity.User;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

@UtilityClass
public class PostSpecification {

    public static Specification<Post> searchPost(String name, String topic, String author) {
        return (Root<Post> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            // Điều kiện tìm theo tên bài viết
            if (StringUtils.isNotBlank(name)) {
                predicates.add(cb.like(cb.lower(root.get(Post.Fields.name)),
                        "%" + name.trim().toLowerCase() + "%"));
            }
            // Điều kiện tìm theo chủ đề
            if (StringUtils.isNotBlank(topic)) {
                predicates.add(cb.like(cb.lower(root.get(Post.Fields.topic)),
                        "%" + topic.trim().toLowerCase() + "%"));
            }
            // Điều kiện tìm theo tên tác giả (join sang bảng User)
            if (StringUtils.isNotBlank(author)) {
                Join<Post, User> authorJoin = root.join("author", JoinType.LEFT);
                predicates.add(cb.like(cb.lower(authorJoin.get(User.Fields.username)),
                        "%" + author.trim().toLowerCase() + "%"));
            }
            // Kết hợp tất cả các điều kiện (AND)
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }


}
